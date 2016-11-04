<#include "../template/header.ftl">
<h1>Listing Groups</h1>
<table>
<tr><th>id</th><th>name</th></tr>
<#list list as g>
	<tr>
	<td><a href="/groups/${g.id}">${g.id}</a></td>
	<td>${g.name}</td>
	<td><a href="/groups/${g.id}/edit">[Edit]</a></td>
</#list>
</table>
<a href="/groups/new">[Create new Group]</a>
<#include "../template/footer.ftl">
