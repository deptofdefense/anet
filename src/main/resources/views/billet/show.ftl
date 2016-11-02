<#include "../template/header.ftl">
<h2>Viewing Billet</h2>

${name}
<br>
Advisor Org: <#if advisorOrganization??> ${advisorOrganization.name} </#if><br>
<#if context.advisor??>
	Currently filled by: ${context.advisor}
<#else>
No person currently in this billet
</#if>
<br>

<a href="/billets/${id}/edit">[Edit this billet]</a>
<#include "../template/footer.ftl">