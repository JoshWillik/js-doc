const path = require('path')
let E = module.exports

E.module_name = file_path => {
	return file_path
	.split('/')
	.reverse()
	.find(p => p !== 'index.js')
	.replace(/\.js$/, '')
}

E.file_docs = async file_path => {
	let mod = require(file_path)
	let mod_entries = []
	for (let [name, entry] of Object.entries(mod)) {
		// TODO josh: is toLocaleString really the correct way to parse
		// this?
		let fn_string = entry.toLocaleString()
		// TODO josh: make this more tolerant of different code styles
		let fn_args = (
			[/\(([a-z0-9_]+)\) {/, /\(?([a-z0-9_]+)\)? =>/i]
			.map(re => re.exec(fn_string))
			.map(m => m && m[1])
			.filter(x => x)[0] || ''
		).split(', ')
		mod_entries.push({name, arguments: fn_args, source: fn_string})
	}
	return '# '+E.module_name(file_path)+'\n\n'
	+mod_entries.map(entry => {
		return '## '+entry.name
		+(!entry.arguments.length ? '' :
		' ('+entry.arguments.join(', ')+')')
	}).join('\n\n')
}

if (!module.parent) {
	let [executable, target] = process.argv
	if (!target) {
		console.log(`Usage: ${executable} <file>`)
		process.exit(1)
	}
	E.file_docs(target)
	.then(docs => console.log(docs))
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
}
