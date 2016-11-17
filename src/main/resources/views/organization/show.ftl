<#include "../template/header.ftl">
<h1>${name}</h1>
An ${type} - <a href="/organizations/${id}/edit">[edit]</a>

<h3>Positions in this Org:</h3>
<#if positions??>
<ul>
<#list positions as position>
<li><a href="/positions/${position.id}">${position.name}</a> -
	<#if position.person??>
		${position.person}
	<#else>
		<i>No person assigned</i>
	</#if>
</li>
</#list>
</ul>
<#else>
<i>No Positions :(</i>
</#if>

<#if type == 'ADVISOR_ORG'>
<h3>POAMs assigned to this Org:</h3>
<ul>
<li>Poam Name TODO</li>
</ul>

<h3>Approval workflow for this Advisor Organization:</h3>
<ul>
<#list approvalSteps as step>
<li>Step #${step?index + 1} - ${step.approverGroup.name}</li>
<#else>
	No approval steps identified for this org yet!
</#list>
</ul>
Add a new approval step:
<div class="form-group">
	<select id="newApprovalGroupSelect" style="width:200px"></select>
	<button id="newApprovalStepBtn" >Create!</button>
</div>
</#if>

<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() {
	$("#newApprovalGroupSelect").select2({
		dropdownParent: $(".mainbody"),
		ajax: {
			url : "/groups/search",
			delay: 250,
			method: 'GET',
			data: function(params) {
				return  { q: params.term}
			},
			processResults : function(data, params) {
				var results = _.map(data, function(el) {
					return {
						id: el["id"],
						text: el["name"]
					}
				});
				return { results: results };
			}
		},
		minimumInputLength: 2
	});

	$("#newApprovalStepBtn").on("click", function(event) {
		var groupId = $("#newApprovalGroupSelect").val();
		$.ajax({
			url: "/approvalSteps/new",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				approverGroup: { id: groupId },
				advisorOrganizationId: ${id}
			})
		}).done(function(response) {
			location.reload();
		});
	});
});

</script>
