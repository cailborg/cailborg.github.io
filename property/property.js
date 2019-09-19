
document.getElementById("submit").addEventListener("click", myFunction);

async function myFunction() {

    // Config stuff

    // let id = document.getElementById('id').value
    let client = document.getElementById('client').value
    let secret = document.getElementById('secret').value
    // const max_price = 1000000
    // const increment = 50000
    // const starting_min_price = 0

    //Auth stuff
    var encodedClient = btoa(client);
    var encodedSecret = btoa(secret);
    let auth = 'Basic' + ' ' + encodedClient + ':' + encodedSecret
    console.log('auth', auth)
    // let data = {"grant_type":"client_credentials","scope":"api_listings_read"}
    // let data = 'grant_type=client_credentials&scope=api_listings_read%20api_agencies_read'
    // console.log('data', data)
    // const response = await fetch('https://auth.domain.com.au/v1/connect/token', {
    // method: 'POST',
    // headers: {
    //     'Authorization': auth,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    // });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://auth.domain.com.au/v1/connect/token', true);
    xhr.setRequestHeader({
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
        });
    xhr.onload = function () {
        // do something to response
        console.log(this.responseText);
    };
    xhr.send('grant_type=client_credentials&scope=api_listings_read%20api_agencies_read');

    let token = await response.json()
    console.log('token', token)
    let access_token = token["access_token"]

    // API stuff
    // let url = "https://api.domain.com.au/v1/listings/" + id
    // let auth = {"Authorization":"Bearer " + access_token}
    // let request = await fetch(url,headers = auth)
    // let r = request.json()
    // console.log(r)
}