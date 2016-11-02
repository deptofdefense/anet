<#include "../template/header.ftl">
<h1>Listing Billets</h1>

<table>
<tr><th>id</th><th>name</th><th>Advisor Organization</th></tr>
<#list billets as billet>
	<tr>
		<td><a href="/billets/${billet.id}">${billet.id}</a></td>
		<td>${billet.name}</td>
		<td>
			<#if billet.advisorOrganization?? >
				<a href="/advisorOrganizations/${billet.advisorOrganization.id}">${billet.advisorOrganization.name}</a>
			</#if>
		</td>
	</tr>
</#list>
</table>
<a href="/billets/new">[Create New Billet]</a>

<#include "../template/footer.ftl">