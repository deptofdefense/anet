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


</body>
</html>