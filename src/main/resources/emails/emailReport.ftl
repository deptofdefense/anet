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
Hi,<br><br>

${sender.name} sent you a report from ANET:

<p><b>${sender.name} wrote:</b> ${comment!}</p>

<ul>
<li><b>Author:</b> ${report.author.name}</li>
<li><b>Summary:</b> ${report.intent}</li>
<li><b>Details:</b> ${report.reportText}</li>
</ul>

<p>Use this link to view the full report: <a href="${serverUrl}/reports/${report.id?c}">${serverUrl}/reports/${report.id?c}</a><p>

</body>
</html>
