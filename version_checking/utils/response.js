const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  }
}

const success = (body) => {
  return buildResponse(200, body);
}

const failure = (body) => {
  return buildResponse(500, body);
}

const response = {
  success: success,
  failure: failure
}

module.exports = response;