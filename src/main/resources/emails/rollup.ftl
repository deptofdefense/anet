<html>
<body>
Hi,

${sender.name} sent you the ANET rollup for ${startDate}

<p><i>${comment!}</i></p>

<ol>
	<#list reports as report>
	<li>
		<p><b>Author</b>: ${report.author.name}</p>
		<p><b>Summary</b>: ${report.intent}</p>
		<p><b>Text</b>: ${report.reportText}</p>
	</#list>
</ol>

<p>You can view the interactive rollup here: <a href="${serverUrl}/rollup">${serverUrl}/rollup</a><p>


</body>
</html>
