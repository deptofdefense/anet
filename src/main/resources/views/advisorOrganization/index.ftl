<#include "../template/header.ftl">
<h1>Listing Advisor Organizations</h1>
<table>
<tr><th>id</th><th>name</th></tr>
<#list list as ao>
	<tr>
	<td><a href="/advisorOrganizations/${ao.id}">${ao.id}</a></td>
	<td>${ao.name}</td>
	<td><a href="/advisorOrganizations/${ao.id}/edit">[Edit]</a></td>
</#list>
</table>
<#include "../template/footer.ftl">
