const cookieName = "ab-test-cookie"
const newHomepagePathName = "/ver2" // b url
const throttle = 50 // 50% of traffic 

const abTest = async ({ request, next, env }) => {
  const url = new URL(request.url)
  // if homepage
  if (url.pathname === "/") {

    let cookie = request.headers.get("cookie")
    // is cookie set and is new cohort?
    if (cookie) {
      if(cookie.includes(`${cookieName}=new`)) {
        // pass the request to /test
        url.pathname = newHomepagePathName
        return env.ASSETS.fetch(url)
      } else {
        return env.ASSETS.fetch(url)
      }
    } else {
      const percentage = Math.floor(Math.random() * 100)
      let version = "current" // default version
      
      // change pathname and version name for 
      if (percentage < throttle) {
        url.pathname = newHomepagePathName
        version = "new"
      }
      // get the static file from ASSETS, and attach a cookie
      const asset = await env.ASSETS.fetch(url)
      let response = new Response(asset.body, asset)
      response.headers.append("Set-Cookie", `${cookieName}=${version}; path=/`)
      return response
    }
  }
  return next()
};

export const onRequest = [abTest];