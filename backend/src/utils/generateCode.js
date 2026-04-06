const generateQuizCode = () => {

  // Allowed characters (A-Z and 2-9, no confusing ones)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // Random length between 4 and 10
  const length = Math.floor(Math.random() * (10 - 4 + 1)) + 4;

  let code = "";

  for (let i = 0; i < length; i++) {

    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );

  }

  return code;
};

module.exports = generateQuizCode;