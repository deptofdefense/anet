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

<p style="color:red; font-size:12px; font-weight: bold;" align="center"><i>Classification: ${SECURITY_BANNER_TEXT}</i></p>
Dear ${approvalStepName},
<br><br>
<div>
  ${report.author.name}'s report, <em><strong>${report.intent}</strong></em>, is ready for your review.<br>
  Using <a href="${serverUrl}/reports/${report.id?c}" />this link</a>,
  you can either <em>Approve</em>, <em>Reject</em> or <em>Edit</em> the report.
</div>
<br>
<#if report.cancelledReason??>
  <p className="report-cancelled" style="border-left:16px solid #DA9795;padding-left:10px;">
    <strong>Cancelled:</strong>
    ${(report.cancelledReason)!}
  </p>
</#if>

<div>
  <strong>Report number:</strong> #${(report.id)}
</div>

<#assign attendees = report.loadAttendees()>
<div>
  <strong>Advisor organization:</strong> ${(report.loadAdvisorOrg().shortName)!}
</div>

<div>
  <strong>Advisor attendees:</strong>
  <ul>
    <#list attendees as attendee>
      <#if attendee.role == "ADVISOR">
        <li>
          ${(attendee.name)!}
          <#assign position = attendee.loadPosition()>
          <#if position??>
            <#assign organization = position.loadOrganization()>
            <#if organization??>
              <em>from</em> ${(organization.shortName)!}
            </#if>
          </#if>
          <#if attendee.primary>
            <em>(primary)</em>
          </#if>
        </li>
      </#if>
    </#list>
  </ul>
</div>

<div>
  <strong>Principal organization:</strong> ${(report.loadPrincipalOrg().shortName)!}
</div>

<div>
  <strong>Principal attendees:</strong>
  <ul>
    <#list attendees as attendee>
      <#if attendee.role == "PRINCIPAL">
         <li>
          ${(attendee.name)!}
          <#assign position = attendee.loadPosition()>
          <#if position??>
            <#assign organization = position.loadOrganization()>
            <#if organization??>
              <em>from</em> ${(organization.shortName)!}
            </#if>
          </#if>
          <#if attendee.primary>
            <em>(primary)</em>
          </#if>
        </li>
      </#if>
    </#list>
  </ul>
</div>

<div>
  <strong>Atmospherics:</strong> ${(report.atmosphere)!}
  <#if report.atmosphereDetails??>
	  - ${(report.atmosphereDetails)!}
  </#if>
</div>

<#assign tags = report.loadTags()>
<#if tags??>
  <div>
    <strong>Tags:</strong>
    <ul>
      <#list tags as tag>
        <li>
          ${(tag.name)!} <em>(${(tag.description)!})</em>
        </li>
      </#list>
    </ul>
  </div>
</#if>

<div>
  <strong>Engagement date and location:</strong> ${(report.engagementDate.toString('dd MMM yyyy'))!} @ ${(report.loadLocation().name)!}
</div>

<#assign poams = report.loadPoams()>
<#list poams as poam>
<div class="row">
  <div class="col-xs-12">
    <#-- <a href="${serverUrl}/poams/${poam.id}"> -->
    <strong>PoAM:</strong> ${(poam.longName)!}
    <#-- </a> -->
  </div>
</div>
</#list>

<div class="row">
  <div class="col-md-8">
    <p><strong>Meeting purpose:</strong> ${(report.intent)!}</p>
    <#if report.keyOutcomes??>
      <p><strong>Key outcomes:</strong> ${(report.keyOutcomes)!}</p>
    </#if>
    <#if report.nextSteps??>
      <p><strong>Next steps:</strong> ${(report.nextSteps)!}</p>
    </#if>
  </div>
</div>

ANET Support Team
<#if SUPPORT_EMAIL_ADDR??>
  <br><a href="mailto:${SUPPORT_EMAIL_ADDR}">${SUPPORT_EMAIL_ADDR}</a>
</#if>

</body>
</html>
