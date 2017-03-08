<html>
<style type="text/css">
body {
	font-family: Arial, Helvetica, SourceSansPro-Regular;
	color: #000000;
	font-size: 11px
}
h1 {
	font-size: 20px
}
h2 {
	font-size: 16px;
}

a {
	color:#0072BD;
}
</style>
<body>
Hi, ${report.author.name}, 

<p>Your report, "<i>${report.intent}</i>," has been approved and added to the daily rollup. </p>

<p>You can view the daily rollup by <a href="${serverUrl}/rollup">clicking here</a>.</p> 

Thanks!<br>
The ANET Team

</body>
</html>
