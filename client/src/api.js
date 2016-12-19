export default {
	fetch(url) {
		return fetch(url, {
			credentials: "same-origin",
			headers: {
				accept: "application/json"
			}
		}).then(response => response.json())
		  .then(function(data) {
			  console.log(data);
			  return data;
		  })
	}
}
