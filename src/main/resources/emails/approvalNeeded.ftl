<html>
<body>
Hello ${approvalStepName}, 

<div>A report in ANET is ready for your approval!:</div>
<ul>
<li><b>Author</b>: ${report.author.name}</li>
<li><b>Summary</b>: ${report.intent}</li>
<li><b>Text:</b>: ${report.reportText}</li>
</ul>

<div>You can check it out <a href="${serverUrl}/reports/${report.id}" />Here</a>.</div>

Thanks!<br>
The ANET Team

</body>
</html>