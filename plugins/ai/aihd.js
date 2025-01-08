import FormData from "form-data"
import Jimp from "jimp"

let handler = async (m, { conn, usedPrefix, command }) => {
  conn.hdr = conn.hdr ? conn.hdr : {}
  if (m.sender in conn.hdr)
    throw "Masih Ada Proses Yang Belum Selesai, Silahkan Tunggu Sampai Selesai Yah~"
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ""
  if (!mime)
    throw `Fotonya Mana?`
  if (!/image\/(jpe?g|png)/.test(mime))
    throw `Mime ${mime} tidak support`
  else conn.hdr[m.sender] = true;
  await conn.sendMessage(m.chat, {
    react: {
      text: "👍",
      key: m.key,
    },
  });
  let img = await q.download?.()
  let error
  try {
    const This = await processing(img, "enhance")
    conn.sendFile(m.chat, This, "", "Dah Jadi~", m)
  } catch (er) {
    error = true
  } finally {
    if (error) {
      m.reply("Proses Gagal :(")
    }
    delete conn.hdr[m.sender]
  }
}

handler.menuai = ['hd', 'remini']
handler.tagsai = ['upscaler']
handler.command = /^(hd|remini)$/i

handler.limit = true

export default handler

async function processing(urlPath, method) {
  return new Promise(async (resolve, reject) => {
    let Methods = ["enhance"]
    Methods.includes(method) ? (method = method) : (method = Methods[0]);
    let buffer,
      Form = new FormData(),
      scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method;
    Form.append("model_version", 1, {
      "Content-Transfer-Encoding": "binary",
      contentType: "multipart/form-data; charset=uttf-8",
    });
    Form.append("image", Buffer.from(urlPath), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    });
    Form.submit(
      {
        url: scheme,
        host: "inferenceengine" + ".vyro" + ".ai",
        path: "/" + method,
        protocol: "https:",
        headers: {
          "User-Agent": "okhttp/4.9.3",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
        },
      },
      function (err, res) {
        if (err) reject();
        let data = [];
        res
          .on("data", function (chunk, resp) {
            data.push(chunk);
          })
          .on("end", () => {
            resolve(Buffer.concat(data));
          });
        res.on("error", (e) => {
          reject();
        });
      }
    );
  });
}
