const isValidToken = (jsonString) => {
  try {
    let o = JSON.parse(jsonString);

    if (o && typeof o === "object") {
      if (o?.salt && o?.publicKey && o?.message && o?.data) {
        return o;
      }
      return false;
    }
    return false;
  } catch (e) {
    console.log(jsonString);
    return false;
  }
};

export default isValidToken;
