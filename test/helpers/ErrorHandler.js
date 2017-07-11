function resolve(err){
  if(err.message == 'Error expected.'){
    throw err;
  }
  Promise.resolve(err);
}

function reject(){
  throw new Error('Error expected.');
}


module.exports = {
  resolve,
  reject,
};
