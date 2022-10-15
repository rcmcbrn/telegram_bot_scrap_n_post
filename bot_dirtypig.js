const TELEGRAMA = require('node-telegram-bot-api')
const DIR = require("path")
const ARCH = require("fs")

let TOLERANCIA_ERROR_K = 0
let TOLERANCIA_ERROR_CZS = 0

const MONEDA = process.env['TLGRM_PIG_TOKEN']
const CERDO = new TELEGRAMA(MONEDA, { polling: true })
const CANAL_PUTAZOS = process.env['TLGRM_VRGZOS']

CERDO.onText(/\/start/, mensaje => {
  let iden = mensaje.chat.id

  console.log(iden);
  CERDO.sendMessage(iden, "CUIIIIIIIIIIIIIIIIIII")
})

CERDO.on("message", mensaje => {
  if (!mensaje.from.id == 777000)
    console.log(mensaje);
})


CERDO.on("channel_post", Canal => {
  //console.log(Canal);
})

CERDO.on('polling_error', console.log);
CERDO.on('error', console.log)

manda_fight_k()

function manda_fight_k() {

  let dir_video = DIR.join(__dirname, "media/fight_k")
  const videos = ARCH.readdirSync(dir_video)
    .filter((arch) => arch.endsWith(".mp4"));

  if (videos.length === 0)
    return console.log('No hay material para subir')

  let elegido = videos[Math.floor(Math.random() * videos.length)]

  if (!elegido)
    console.log('ese video no existe en la db >:c');
  else
    console.log('Se subira ', elegido);

  if (!elegido) return false

  let videos_db = ARCH.readFileSync('./db_fight_k.json',
    { encoding: 'utf8', flag: 'r' })

  videos_db = JSON.parse(videos_db)

  let video_en_bd = videos_db.fight_k.find(v => v.url_video.split('/').pop() == elegido)

  if (TOLERANCIA_ERROR_K >= 5 && !video_en_bd) {
    console.log('Que pedo con los videos????');
    process.exit(0)
  }

  if (!video_en_bd) {
    TOLERANCIA_ERROR_K++
    manda_video()
  }

  TOLERANCIA_ERROR_K = 0

  CERDO.sendVideo(
    chat_id = CANAL_PUTAZOS,
    dir_video + "/" + elegido,
    { caption: "<b>" + video_en_bd.title + " </b>", parse_mode: 'HTML', thumb: (video_en_bd.thumb || '') },
    { contentType: 'video/mp4' }
  ).then(() => {
    ARCH.unlinkSync(dir_video + "/" + elegido)
    console.log("Archivo publicado! " + elegido);
    setTimeout(() => {
      manda_fight_czs()
    }, 501000)
  }).catch(error => {
    console.log("hubo un problema subiendo " + elegido);
    console.log(error.response.body.description);
  })
}

function manda_fight_czs() {

  let dir_video = DIR.join(__dirname, "media/fight_czs")
  const videos = ARCH.readdirSync(dir_video)
    .filter((arch) => arch.endsWith(".mp4"));

  if (videos.length === 0)
    return console.log('No hay material para subir')

  let elegido = videos[Math.floor(Math.random() * videos.length)]

  if (!elegido)
    console.log('ese video no existe en la db >:c');
  else
    console.log('Se subira ', elegido);

  if (!elegido) return false

  let videos_db = ARCH.readFileSync('./db_fight_czs.json',
    { encoding: 'utf8', flag: 'r' })

  videos_db = JSON.parse(videos_db)

  let video_en_bd = videos_db.fight_czs.find(v => v.url_video.split('/').pop() == elegido)

  if (TOLERANCIA_ERROR_CZS >= 5 && !video_en_bd) {
    console.log('Que pedo con los videos????');
    process.exit(0)
  }

  if (!video_en_bd) {
    TOLERANCIA_ERROR_K++
    manda_video()
  }

  TOLERANCIA_ERROR_K = 0

  CERDO.sendVideo(
    chat_id = CANAL_PUTAZOS,
    dir_video + "/" + elegido,
    { caption: "<b>" + video_en_bd.title + " </b>", parse_mode: 'HTML', thumb: (video_en_bd.thumb || '') },
    { contentType: 'video/mp4' }
  ).then(() => {
    ARCH.unlinkSync(dir_video + "/" + elegido)
    console.log("Archivo publicado! " + elegido);
    setTimeout(() => {
      manda_fight_k()
    }, 501000)
  }).catch(error => {
    console.log("hubo un problema subiendo " + elegido);
    console.log(error.response.body.description);
  })
}
