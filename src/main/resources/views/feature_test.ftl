<!DOCTYPE html>
<html lang="en">
<head>
	<title>ANET Feature Test</title>
	<script src="/assets/js/modernizr-custom.min.js"></script>
</head>
<body>
	<script>
		var info = {};
		info.user_agent = navigator.userAgent;
		info.size = {width: window.innerWidth, height: window.innerHeight};
		info.features = Modernizr;

		var request = new XMLHttpRequest();
		request.open('POST', '/testing/features');
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(info));
	</script>
</body>
</html>
