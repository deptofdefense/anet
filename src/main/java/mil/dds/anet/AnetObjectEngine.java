package mil.dds.anet;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

import org.skife.jdbi.v2.DBI;
import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.database.AdminDao;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.database.ApprovalActionDao;
import mil.dds.anet.database.ApprovalStepDao;
import mil.dds.anet.database.CommentDao;
import mil.dds.anet.database.LocationDao;
import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.PoamDao;
import mil.dds.anet.database.PositionDao;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.database.SavedSearchDao;
import mil.dds.anet.database.TestingDao;
import mil.dds.anet.search.ISearcher;
import mil.dds.anet.search.mssql.MssqlSearcher;
import mil.dds.anet.search.sqlite.SqliteSearcher;
import mil.dds.anet.utils.DaoUtils;

public class AnetObjectEngine {

	TestingDao dao;
	PersonDao personDao;
	PoamDao poamDao;
	LocationDao locationDao;
	OrganizationDao orgDao;
	PositionDao positionDao;
	ApprovalStepDao asDao;
	ApprovalActionDao approvalActionDao;
	ReportDao reportDao;
	CommentDao commentDao;
	AdminDao adminDao;
	SavedSearchDao savedSearchDao;

	ISearcher searcher;
	
	private static AnetObjectEngine instance; 
	
	Handle dbHandle;
	
	public AnetObjectEngine(DBI jdbi) { 
		dbHandle = jdbi.open();
		
		personDao = new PersonDao(dbHandle);
		poamDao = new PoamDao(dbHandle);
		locationDao =  new LocationDao(dbHandle);
		orgDao = new OrganizationDao(dbHandle);
		positionDao = new PositionDao(dbHandle);
		asDao = new ApprovalStepDao(dbHandle);
		approvalActionDao = new ApprovalActionDao(dbHandle);
		reportDao = new ReportDao(dbHandle);
		commentDao = new CommentDao(dbHandle);
		adminDao = new AdminDao(dbHandle);
		savedSearchDao = new SavedSearchDao(dbHandle);
		
		instance = this;
		
		//TODO: maybe do this differently!
		if (DaoUtils.isMsSql(dbHandle)) { 
			searcher = new MssqlSearcher();
		} else { 
			searcher = new SqliteSearcher();
		}
	}
	
	public PersonDao getPersonDao() { 
		return personDao;
	}
	
	public PoamDao getPoamDao() { 
		return poamDao;
	}

	public LocationDao getLocationDao() {
		return locationDao;
	}

	public OrganizationDao getOrganizationDao() {
		return orgDao;
	}

	public ApprovalActionDao getApprovalActionDao() {
		return approvalActionDao;
	}

	public PositionDao getPositionDao() {
		return positionDao;
	}

	public ApprovalStepDao getApprovalStepDao() {
		return asDao;
	}

	public ReportDao getReportDao() {
		return reportDao;
	}
	
	public CommentDao getCommentDao() { 
		return commentDao;
	}
	
	public AdminDao getAdminDao() { 
		return adminDao;
	}
	
	public SavedSearchDao getSavedSearchDao() { 
		return savedSearchDao;
	}
	
	public ISearcher getSearcher() {
		return searcher;
	}

	public Organization getOrganizationForPerson(Person p) { 
		if (p == null) { return null; } 
		return personDao.getOrganizationForPerson(p.getId());
	}
	
	public List<ApprovalStep> getApprovalStepsForOrg(Organization ao) { 
		Collection<ApprovalStep> unordered = asDao.getByAdvisorOrganizationId(ao.getId());
		
		int numSteps = unordered.size();
		LinkedList<ApprovalStep> ordered = new LinkedList<ApprovalStep>();
		Integer nextStep = null;
		for (int i=0;i<numSteps;i++) { 
			for (ApprovalStep as : unordered) { 
				if (Objects.equals(as.getNextStepId(), nextStep)) { 
					ordered.addFirst(as);
					nextStep = as.getId();
					break;
				}
			}
		}
		return ordered;
	}
	
	public boolean canUserApproveStep(Integer userId, int approvalStepId) { 
		ApprovalStep as = asDao.getById(approvalStepId);
		for (Position approverPosition: as.loadApprovers()) {
			//approverPosition.getPerson() has the currentPersonId already loaded, so this is safe. 
			if (Objects.equals(userId, DaoUtils.getId(approverPosition.getPerson()))) { return true; } 
		}
		return false;
	}

	public static AnetObjectEngine getInstance() { 
		return instance;
	}
	
	public String getAdminSetting(AdminSettingKeys key) { 
		return adminDao.getSetting(key);
	}
}
