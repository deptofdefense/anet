<!DOCTYPE html>
<html lang="en">
<head>
	<title>ANET Feature Test</title>
	<script src="/assets/js/modernizr-custom.min.js"></script>
</head>
<body>
	<form id="form">
		<label for="name">Please enter your name:</label>
		<input type="text" id="name">
		<input type="submit" value="Submit">
	</form>
	<script>
		function submitTelemetry() {
			var info = userInfo();
			info.size = {width: window.innerWidth, height: window.innerHeight};
			info.features = Modernizr;

			var request = sendRequest('POST', '/testing/features', info);
			request.addEventListener('load', function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						document.write('<p>Feature test completed successfully. Thank you!</p>');
						document.write(this.responseText);

						var secondInfo = userInfo();
						secondInfo.round_trip_time = secondInfo.request_time - info.request_time;
						sendRequest('POST', '/testing/features', secondInfo);
					} else {
						document.write('There was an error running the test. Would you mind trying again? If this continues, please let the ANET team know. Thank you!');
					}
				}
			});
		}

		document.getElementById('form').addEventListener('submit', function(event) {
			userName = document.getElementById('name').value;
			submitTelemetry();
			event.stopPropagation();
			event.preventDefault();
		});

		function userInfo() {
			var info = {};
			info.request_time = Date.now();
			info.user_name = userName;
			info.user_agent = navigator.userAgent;
			return info;
		}

		function sendRequest(method, url, data) {
			var request = new XMLHttpRequest();
			request.open(method, url);
			if (data) {
				request.setRequestHeader('Content-Type', 'application/json');
				request.send(JSON.stringify(data));
			} else {
				request.send();
			}
			return request;
		}
	</script>
</body>
</html>
