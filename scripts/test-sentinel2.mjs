const res = await fetch("https://services.sentinel-hub.com/oauth/token", {
  method: "POST",
  headers: {"Content-Type": "application/x-www-form-urlencoded"},
  body: "grant_type=client_credentials&client_id=PLAK47103fdd8f9045abba468c97b025b079&client_secret=PLAK47103fdd8f9045abba468c97b025b079"
});
console.log("Status:", res.status);
console.log("Body:", await res.text());
