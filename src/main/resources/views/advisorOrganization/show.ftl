<#include "../template/header.ftl">
<h1>${name}</h1>
An Advisor Organization

<h3>Billets in this AO:</h3>
<#if billets??>
<ul> 
<#list billets as billet>
<li><a href="/billets/${billet.id}">${billet.name}</a> - 
	<#if billet.advisor??>
		${billet.advisor}
	<#else>
		<i>No advisor assigned</i>
	</#if>
</li>
</#list>
</ul>
<#else>
<i>No Billets :(</i>
</#if>

<h3>POAMs assigned to this AO:</h3>
<ul>
<li>Poam Name </li>
</ul>

<h3>Approval workflow for this POAM:</h3> 
<ul>
<li>Step # - group name who can approve</li>
</ul>


<#include "../template/footer.ftl">