// lib/socketState.js
let currentSock = null;

function setSock(sock) {
  currentSock = sock;
}

function getSock() {
  return currentSock;
}

module.exports = { setSock, getSock };
