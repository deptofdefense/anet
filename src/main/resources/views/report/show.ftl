<#import "../application/layout.ftl" as application>
<@application.layout>
Report: ${id} - ${engagementDate}<br>

<ul>
<li>Author: <a href="/people/${author.id}">${author.name}</a></li>
<li>Location: <#if location??>${location.name}</#if></li>
<li>Atmospherics: ${atmosphere} - ${atmosphereDetails!}</li>
<li>Attendees: <#list attendees as p>${p.firstName} ${p.lastName} (${p.rank}) - ${p.role}, </#list></li>
</ul>
<p>${reportText}<p>
<p><b>Next Steps: </b>${nextSteps}</p>

<i>Created at: ${createdAt} - Updated at: ${updatedAt} </i><br>

<#if context.currentUser.id == author.id>
	<#if state == "DRAFT" >
		<button class="reportSubmitBtn" data-id="${id}" >Submit this report.</button>
		<button class="reportEditBtn" >Edit</button>
	<#else>
		<#if state == "PENDING_APPROVAL">
			Your report is in for review and here is the progress:
	    <#else>
			Your report has been released, here is the approval steps:
		</#if>
		<table>
			<tr><td>stage</td><td>Status</td><td>Approvers</td></tr>
			<#list approvalStatus as action>
				<tr>
					<td>${action?index}</td>
					<td>
						<#if action.type??>
							${action.type} by ${action.person} on ${action.createdAt}
	      				</#if>
	      			</td>
	      			<td><a href="/groups/${action.step.approverGroup.id}">${action.step.approverGroup.name}</a></td>
	      		</tr>
	      	</#list>
	      </table>
	      <button class="reportEditBtn">Edit Report</button>
	</#if>
<#elseif state == "PENDING_APPROVAL" >
	<#--  check if this user can approve this TODO: make this suck less.  -->
	<#list approvalStep.approverGroup.members as m>
		<#if m.id == context.currentUser.id>
			You can approve this report!
	      	<button data-id="${id}" class="reportRejectBtn btn btn-danger" >Reject</button>
	      	<button data-id="${id}" class="reportEditBtn btn btn-primary">Edit</button>
	      	<button data-id="${id}" class="reportApproveBtn btn btn-primary" >Approve</button>
	      </#if>
	</#list>
</#if>

<h5>Comments:</h5>

<#list comments>
	<table>
	<#items as comment>
		<tr>
			<td>${comment.author} at ${comment.createdAt}</td>
			<td>${comment.text}</td>
			<#if context.currentUser.id == comment.author.id>
				<td><a class="deleteComment" data-id="${comment.id}">[Delete]</td>
			</#if>
		</tr>
	</#items>
	</table>
<#else>
	<i>No comments</i>
</#list>

<div>
Post a new comment on this report:
<textarea id="newCommentText"></textarea>
<button id="newCommentBtn">Save!</button>
</div>

<script type="text/javascript">
$(document).ready(function() {
	$(".reportSubmitBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/submit",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});

	$(".reportApproveBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/approve",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});
	$(".reportRejectBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/reject",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});
	$(".reportEditBtn").on("click", function(event) {
		window.location = "/reports/${id}/edit"
	});

	$("#newCommentBtn").on("click", function(event) {
		var comment = {text: $("#newCommentText").val() };
		$.ajax({
			url: "/reports/${id}/comments",
			contentType: "application/json",
			method: "POST",
			data: JSON.stringify(comment)
		}).done(function(response) {
			location.reload();
		});
	});
	$(".deleteComment").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/${id}/comments/" + id,
			method: "DELETE",
		}).done(function(response) {
			location.reload();
		});
	});

});
</script>

</@application.layout>
