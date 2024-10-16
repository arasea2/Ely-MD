import db from '../../lib/database.js'
import similarity from 'similarity'
const threshold = 0.72

export async function before(m) {
	let user = db.data.users[m.sender]
	if (!user || user.banned) return !1
	let id = m.chat
	if (!m.quoted || !m.quoted.fromMe || !m.text)
		return !0
	this.tebaklirik = this.tebaklirik ? this.tebaklirik : {}
	if (!(id in this.tebaklirik))
		return
	if (m.quoted.id == this.tebaklirik[id][0].id) {
		let json = JSON.parse(JSON.stringify(this.tebaklirik[id][1]))
		if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
			user.exp += this.tebaklirik[id][2]
			user.spamcount += 2
			this.reply(m.chat, `*Benar!* 🎉\n\n+${this.tebaklirik[id][2]} Exp`, m)
			clearTimeout(this.tebaklirik[id][3])
			delete this.tebaklirik[id]
		} else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold)
			m.reply(`*Dikit Lagi!*`)
		else
			m.reply(`*Salah!*`)
	}
	return !0
}

export const exp = 0