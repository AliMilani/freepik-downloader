const input = require("input");
const tor_axios = require("tor-axios");
const { exec } = require("child_process");

const tor = tor_axios.torSetup({
  ip: "127.0.0.1",
  port: 9050,
});

async function getDownloadLink(url) {
  if (!url.includes("freepik.com") || !url.includes("htm"))
    throw new Error("url must be a freepik link!");
  if (url === "") throw new Error("url most not be empty!");
  if (url.includes("freepik.com/premium"))
    throw new Error(
      "we can't download this file! \nBecause it's a premium file!"
    );
  if (!/_.*\d.*.htm/g.test(url)) throw new Error("url must be a freepik link!");
  let id = url.match(/_.*\d.*.htm/g)[0].replace(/[^0-9]/g, "");
  if (!id)
    throw new Error(
      `Invalid URL! \nPlease check your URL and try again! {id:${id}}`
    );
  let token = await getToken();
  if (!token)
    throw new Error(
      "Something went wrong! \nPlease check tor or internet connection and try again!"
    );
  let validateTokenResult = await validateToken(token, url);
  //   console.log("token:", token);
  //   console.log("validateTokenResult:", validateTokenResult);
  return await tor
    .get("https://www.freepik.com/xhr/download-url/" + id, {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        csrfToken: token,
      },
      referrer: url,
    })
    .then((r) => r.data.url);
}

async function getToken() {
  return await tor
    .get("https://www.freepik.com/xhr/promotes/?domain=english", {
      headers: {
        "x-requested-with": "XMLHttpRequest",
      },
    })
    .then((e) => e.data)
    .then((r) => r.csrfToken)
    .catch((e) => {
      console.log("validate error:", e);
      return false;
    });
}

async function validateToken(token, referrer) {
  return await tor
    .get("https://www.freepik.com/xhr/validate", {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        csrfToken: token,
      },
      referrer: referrer,
    })
    .then((e) => e.data);
}

(async () => {
  //run for ever and ever
  console.log("connecting to tor...");
  //run tor
   exec("Tor\\tor.exe -f Tor\\torrc| more", (error, stdout, stderr) => {
    if (error) {
      throw new Error(error);
    }
  });

  let downloadUrl = "";
  while (true) {
    try {
      downloadUrl = await getDownloadLink(await input.text("link =>> "));
      console.log("Download URL : \n", downloadUrl, "\n");
      console.log("=========================");

      //open download url
      exec(`start ${downloadUrl}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {
      console.log("Error : ", e.message);
    }
  }
})();
