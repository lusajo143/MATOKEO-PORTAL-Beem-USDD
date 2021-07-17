const express = require("express");
const fetch = require('node-fetch')
const fs = require('fs')

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/**
 * ussd_menu: Json array for storing USSD menu
 */
const ussd_menu = [
  {text: 'MATOKEO PORTAL Chagua Kidato 1. Kidato cha Kwanza\n 2. Kidato cha Pili \n3. Kidato cha Tatu\n4. Kidato cha Nne'},
  {text: 'Ingiza namba ya usajili ya Mwanafunzi'},
  {text: 'Ingiza neno la siri la '},
  {text: 'Matokeo yako ni 11'}
]

/**
 * sessions:  Used to track all user inputs before requesting for student's results from
 *            student-management-system server
 *            Also it tracks user sessions lifecycle i.e initialize, continue and terminate
 * 
 * id:        Store session_id
 * level:     Tracks how far user session has reach in ussd_menu
 * Kidato:    Stores session response for kidato
 * UsajiliNo: Stores registration number for a student
 */
var sessions = [
  {
    id: 1,
    level: 0,
    Kidato: 0,
    UsajiliNo: 0
  }
]

/**
 * Increments level of particular session. It controls output of the session
 * @param {*} ID :session_id
 */
function incrementLevel(ID) {
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index];
    if (element.id == ID) {
      sessions[index].level = element.level+1
    }
  }
  console.log('Session: '+ID+' incremented')
}

/**
 * Decrements level of particular session
 * @param {*} ID :session_id
 */
function decrementLevel(ID) {
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index];
    if (element.id == ID) {
      sessions[index].level = element.level-1
    }
  }
  console.log('Session: '+ID+' decremented')
}

/**
 * Resets level of particular session i.e Returns to First menu
 * @param {*} ID :session_id
 */
function startOver(ID) {
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index];
    if (element.id === ID) {
      sessions[index].level = 0
      console.log('Started over for session: '+ID)
    }
  }
}

/**
 * @param {*} ID :session_id
 * @returns :The current level of a session
 */
function getLevel(ID) {
  let current_level = 0
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index]
    if (element.id === ID)
      current_level = element.level
  }
  return current_level
}

/**
 * 
 * @param {*} ID :session_id
 * @param {*} kidato :kidato of particular student(session response)
 */
function addKidato(ID, kidato) {
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index];
    if (element.id === ID) {
      sessions[index].Kidato = kidato
      break
    }
  }
  console.log('Session '+ID+' Updated Kidato')
  console.log(sessions)
}

/**
 * @param {*} ID :session_id
 * @returns :kidato of particular student(session response)
 */
function getKidato(ID) {
  let kidato = 0
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index]
    if (element.id === ID)
      kidato = element.Kidato
  }
  return kidato
}

/**
 * @param {*} ID :session_id
 * @param {*} usajili :Registraction number of a student
 */
function addUsajili(ID, usajili) {
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index];
    if (element.id === ID) {
      sessions[index].UsajiliNo = usajili
      break
    }
  }
  console.log('Session '+ID+' Updated Usajili')
  console.log(sessions)
}

/**
 * @param {*} ID :session_id
 * @returns :Registraction number of a student
 */
function getUsajili(ID) {
  let usajili = 0
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index]
    if (element.id === ID)
      usajili = element.UsajiliNo
  }
  return usajili
}

/**
 * Request student results from student-management-system server
 * @param {*} kidato :kidato
 * @param {*} usajili :registraction number of a student
 * @param {*} nenoSiri :Password of a student
 * @returns :response in json
 */
async function requestMatokeo(kidato, usajili, nenoSiri) {
  let res = await fetch('http://127.0.0.1:5000/beem-challenge/ussd/matokeo',{
    method: 'POST',
    body:    JSON.stringify({Kidato: parseInt(kidato), Usajili: parseInt(usajili), NenoSiri: nenoSiri}),
    headers: { 'Content-Type': 'application/json' }
  })
  return await res.json()
}

/**
 * Sending responses to the session
 * @param {*} req :req
 * @param {*} res :res
 * @param {*} respToSend :request text to send
 */
function send(req, res, respToSend) {
  const resp = {
    "msisdn": req.body.msisdn,
    "operator": req.body.operator,
    "session_id": req.body.session_id,
    "command": req.body.command,
    "payload": {
        "request_id": 1,
        "request": respToSend
    }
  }
  res.json(resp)
}

/**
 * Terminating a session and removing it from sessions array
 * @param {*} req :req
 * @param {*} res :res
 * @param {*} ID :session_id
 */
function terminate(req, res, ID) {
  let pos = 0
  for (let index = 0; index < sessions.length; index++) {
    const element = sessions[index];
    if (element.id === ID) {
      pos = index
      break
    }
  }

  console.log('Session Terminated: '+sessions[pos].id)
  sessions.splice(pos, 1)

  const resp = {
    "msisdn": req.body.msisdn,
    "operator": req.body.operator,
    "session_id": req.body.session_id,
    "command": "terminate",
    "payload": {
        "request_id": 1,
        "request": "Asante na Karibu tena"
    }
  }
  res.json(resp)
  console.log(sessions)
}

app.post("/", (req, res) => {

  let {
    command,
    msisdn,
    session_id,
    operator,
    payload: { request_id, response },
  } = req.body;

  // On terminating
  if (req.body.command === "terminate") {
    terminate(req, res, session_id)
  }
  // On continue
  else if (req.body.command === "continue") {
    console.log('Continued')

    let respToSend = ''
    
    incrementLevel(session_id)

    // addKidato(session_id, response)
    // Response = kidato
    if (getLevel(session_id) === 1) {
      if (response >= 1 && response <= 4) {
        addKidato(session_id, response)
        respToSend += ussd_menu[getLevel(session_id)].text
        send(req, res, respToSend)
      }
      else {
        decrementLevel(session_id)
        respToSend += 'Chaguo uliloingiza sio sahihi. '+ussd_menu[getLevel(session_id)].text
        send(req, res, respToSend)
      }
      
    }
    // Process usajili, request neno la siri
    // Response = usajili
    else if (getLevel(session_id) === 2){
      addUsajili(session_id, response)
      respToSend += ussd_menu[getLevel(session_id)].text + getUsajili(session_id)
      send(req, res, respToSend)
    }
    // Process neno la siri & get matokeo, return matokeo
    // Response = nenoSiri
    else if (getLevel(session_id) === 3) {
      requestMatokeo(getKidato(session_id),getUsajili(session_id),response)
        .then(data => {
          if (data.Status)
            respToSend += 'MATOKEO YA MWANAFUNZI '+getUsajili(session_id)+' NI '+ data.Matokeo+' \nChagua 1.Kuendelea 2.Kutoka'
          else
            respToSend +=  'Namba ya usajili au Neno la siri sio sahihi Chagua 1.Kuendelea 2.Kutoka'
          send(req, res, respToSend)
        })
    }
    // Process Continue / Exit options
    // Response = option
    else if (getLevel(session_id) === 4) {
      if (response === '1') {
        startOver(session_id)
        respToSend += ussd_menu[0].text
        send(req, res, respToSend)
      } else if (response === '2') {
        terminate(req, res, session_id)
      } else {
        respToSend += 'Chaguo uliloingiza sio sahihi.   \nChagua 1.Kutoka 2.Kuendelea'
        decrementLevel(session_id)
        send(req, res, respToSend)
      }
    }
    
  }
  // On initialize
  else {
    sessions.push({
      id: session_id,
      level: 0,
      Kidato: 0,
      UsajiliNo: 0
    })

    const resp = {
      "msisdn": req.body.msisdn,
      "operator": req.body.operator,
      "session_id": req.body.session_id,
      "command": 'continue',
      "payload": {
          "request_id": 1,
          "request": ussd_menu[0].text
      }
    }
  res.json(resp);
  }
    
});

app.listen(4000, () => {
  console.log("app running on port 4000");
});
