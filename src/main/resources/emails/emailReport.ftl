<html>
<body>
Hi,

${sender.name} sent you an ANET Report"

<p><i>${comment!}</i></p> 

<ul>
<li><b>Author</b>: ${report.author.name}</li>
<li><b>Summary</b>: ${report.intent}</li>
<li><b>Text:</b>: ${report.reportText}</li>
</ul>

<p>You can view the full report here: <a href="${serverUrl}/reports/${report.id}">${serverUrl}/reports/${report.id}</a><p>


</body>
</html>