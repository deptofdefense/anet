<#import "../application/layout.ftl" as application>
<@application.layout>
<h3>Report: ${id} - ${engagementDate!}<br></h3>
	<section class="anet-block">
		<div class="anet-block__title">
			Report details
		</div>

		<div class="anet-block__body">
			<div class="report-details row">
				<div class="col-md-6">
					<ul>
						<li><h5 class="inline">Author:</h5> <a href="/people/${author.id}">${author.name}</a></li>
						<li><h5 class="inline">Location:</h5> <#if location??>${location.name}</#if></li>
						<li><h5 class="inline">Atmospherics:</h5> ${atmosphere} - ${atmosphereDetails!}</li>
						<ul><h5>Attendees</h5>
							<#list attendees as p>
								<li>
									<#if p.role == "PRINCIPAL">
										<img class="participant_img" src="/assets/img/part_afg.png">
									<#else>
										<img class="participant_img" src="/assets/img/part_nato.png">
									</#if>
								${p.name} (${p.rank!}) - ${p.role}</li>
							</#list>
						</ul>
					</ul>
				</div>
				<div class="col-md-6">
					<h5>Discussion</h5>
					<p>${reportText}<p>
					<h5>Next Steps</h5>
					<p>${nextSteps}</p>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<small>Created at: ${createdAt} - Updated at: ${updatedAt} </small>
				</div>
			</div>
		</div>
</section>
<div class="container-fluid">
	<div class="row">
		<div class="col-md-12">
		<div class="pull-right">
			<#if context.currentUser.id == author.id>
				<#if state == "DRAFT" >
					<button class="reportEditBtn" >Edit</button>
					<button class="reportSubmitBtn" data-id="${id}" >Submit report</button>
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
		</div>
		</div>
	</div>
</div>
<section class="anet-block">
		<div class="anet-block__title">
			Comments and Approval
		</div>

		<div class="anet-block__body">
			<div class="row">
			<div class="col-md-12 comments">
				<h5>Comments:</h5>

				<#list comments>
					<table class="comment">
					<#items as comment>
						<tr>
							<td>${comment.author}</td>
							<td>${comment.text!}</td>
							<#if context.currentUser.id == comment.author.id>
								<td class="delete"><a class="deleteComment" data-id="${comment.id}"><button type="button" class="btn btn-danger">Delete</button></td>
							</#if>
						</tr>
						<tr>
						<td class="timestamp" colspan=3><small>${comment.createdAt}</small></td>
						</tr>
					</#items>
					</table>
				<#else>
					<i>No comments</i>
				</#list>
			</div>
		</div>
		<div class="row  commentbtn">
			<div class="col-md-8">
				<button data-toggle="tooltip" title="Your comment will be added above" class="pull-right" id="newCommentBtn">Submit Comment</button>
				<button data-toggle="tooltip" title="Author will be asked to resubmit" class="pull-right" id="reject">Return to Author</button>
				</div>
			</div>
		</div>
	</div>

<div class="modal returnReport fade">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title">Send Back Report?</h4>
      </div>
      <div class="modal-body">
      	<label for="newCommentTextReject">Why are you rejecting the report?</label>
        <textarea id="newCommentText"></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary rejectSend">Save changes</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script type="text/javascript">
$(document).ready(function() {
	var id = $('[data-id]').attr("data-id");
	$(".reportSubmitBtn").on("click", function(event) {
		$.ajax({
			url: "/reports/" + id + "/submit",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});

	$('#reject').on('click',function() {
		$('.returnReport.modal').modal('show')
	})

	$('.rejectSend').on('click',function() {
		$('.modal-body').html('Saving...').delay(1000, function() {

			var comment = {text: $("#newCommentText").text()};
			debugger
			$.ajax({
				url: "/reports/" + id + "/comments",
				contentType: "application/json",
				method: "POST",
				data: JSON.stringify(comment)
			}).done(function(response) {
				location.reload();
			});

			$('.returnReport.modal').modal('hide')
			$('.commentbtn').html('The report has been returned to ${author.name}')
		})
	})

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
