const FETCH = require("node-fetch")
const HTML = require('cheerio')
const FILE = require("fs")

const fight_czs__ = process.env['fight_czs__']

let page = ''

let db = {}

db = FILE.readFileSync('./db_fight_czs.json',
  { encoding: 'utf8', flag: 'r' })

db = JSON.parse(db)

function start_bot() {
  console.log('\n\n\nleyendo sitio ' + page);
  console.log();
  FETCH(fight_czs__ + page)
    .then(r => r.text())
    .then(async t => {
      let pagina = HTML.load(t)
      let videos = pagina('.tile')

      console.log("Se encontraron... " + videos.length + " videos.", new Date().toLocaleTimeString())

      if (videos.length === 0) return

      for (let video of videos) {
        let elemento = video.children.find(t => t.name === 'a')
        let enlace = elemento.attribs.href
        let titulo = elemento.attribs.title
        let divisor = elemento.children.find(t => t.name === 'div')
        let imagen_miniatura = divisor.children.find(t => t.name === 'img')
        let url_miniatura = imagen_miniatura.attribs.src

        await get_video_url(enlace, titulo, url_miniatura)
      }

      switch (page) {
        case '':
          page = '2/'
          break;
        case '2/':
          page = '3/'
          break;
        case '3/':
          page = '4/'
          break;
        case '4/':
          page = '5/'
          break;
        case '5/':
          page = '6/'
          break;
        case '6/':
          page = '7/'
          break;
        case '7/':
          page = '8/'
          break;
        case '8/':
          page = '9/'
          break;
        case '9/':
          page = '10/'
          break;
        case '10/':
          page = undefined
          break;
      }

      if (page) start_bot()
      else {
        setTimeout(() => {
          page = ''
          start_bot()
        }, 3600000) // hora
      }
    })
}

async function get_video_url(video_url, video_title, video_thumb) {
  let get_video_html = await FETCH(video_url)
    .then(r => r.text())

  console.log('procesando', video_title, '...');

  let web_page = HTML.load(get_video_html)

  let videos_found = web_page('video source')

  for (let video of videos_found) {
    let video_source = video.attribs.src
    let label = video.attribs.type
    let peso, archivo_completo

    if (label !== 'video/mp4') continue;

    let exists = db.fight_czs.find(v => v.url == video_url)

    if (exists) {
      console.log('ese video ya ha se habia guardado :\'(');
      continue;
    }

    console.log("scraping \"" + video_title + "\"...");

    let record = {
      url: video_url,
      url_video: video_source,
      title: video_title,
      thumb: video_thumb
    }
    try {

      console.log("buscando video en la pagina", new Date().toLocaleTimeString());

      const response = await FETCH(video_source)

      peso = response.headers.get('content-length')

      if (Number(peso) > 104857600) continue

      archivo_completo = './media/fight_czs/' + video_source.split('/').pop()

      if (Number(peso) > 52428800)
        archivo_completo = './media/fight_czs_pesados/' + video_source.split('/').pop()

      console.log('video conseguido, ahora leyendo buffer(', peso, ')', new Date().toLocaleTimeString());

      const buffer = await response.buffer();

      console.log('buffer descargado, guardando en disco...', new Date().toLocaleTimeString())

      FILE.writeFile(archivo_completo, buffer, err => {
        if (!err) {
          db.fight_czs.push(record)
          console.log(archivo_completo, "Guardado!", new Date().toLocaleTimeString())
          save_db()
          console.log();
        }
      })
    }
    catch (error) {
      console.log("error found", error)
      continue
    }

  }
}

function save_db() {
  FILE.writeFileSync('./db_fight_czs.json', JSON.stringify(db, null, 2),
    (err) => {
      if (err) {
        console.log("ocurrio un error", err);
        process.exit()
      }
    })
}

console.log("Iniciando super script para hackear la nasa");
start_bot()

