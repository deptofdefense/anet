<html>
<body>
Hello ${approvalStepName}, 

<div>${report.author.name}'s report, <i>${report.intent}</i>, is ready for your review. To review the report, <a href="${serverUrl}/reports/${report.id}" />click here</a>.</div>
<ul>
<li><b>The Key Outcomes were</b>: ${report.keyOutcomes!}</li>
<li><b>The Next Steps are:</b>: ${report.nextSteps!}</li>
<li><b>Text:</b>: ${report.reportText!}</li>
</ul>

<#if report.cancelledReason??>
<b>This report was CANCELLED for: ${report.cancelledReason}</b><br><br>
</#if> 

Thanks!<br>
The ANET Team

</body>
</html>