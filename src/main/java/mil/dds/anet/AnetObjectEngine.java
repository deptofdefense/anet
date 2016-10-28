package mil.dds.anet;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.skife.jdbi.v2.DBI;
import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.AdvisorOrganizationDao;
import mil.dds.anet.database.ApprovalActionDao;
import mil.dds.anet.database.ApprovalStepDao;
import mil.dds.anet.database.BilletDao;
import mil.dds.anet.database.GroupDao;
import mil.dds.anet.database.IAnetDao;
import mil.dds.anet.database.LocationDao;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.PoamDao;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.database.TashkilDao;
import mil.dds.anet.database.TestingDao;
import mil.dds.anet.views.AbstractAnetView;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

//TODO: change this name
public class AnetObjectEngine {

	TestingDao dao;
	PersonDao personDao;
	GroupDao groupDao;
	TashkilDao tashkilDao;
	PoamDao poamDao;
	LocationDao locationDao;
	AdvisorOrganizationDao aoDao;
	BilletDao billetDao;
	ApprovalStepDao asDao;
	ApprovalActionDao approvalActionDao;
	ReportDao reportDao;

	private static Map<Class<? extends AbstractAnetView<?>>, IAnetDao<?>> daoMap; 
	
	Handle dbHandle;
	
	public AnetObjectEngine(DBI jdbi) { 
		dbHandle = jdbi.open();
		
		personDao = new PersonDao(dbHandle);
		groupDao = new GroupDao(dbHandle);
		tashkilDao = jdbi.onDemand(TashkilDao.class);
		poamDao = jdbi.onDemand(PoamDao.class);
		locationDao =  new LocationDao(dbHandle);
		aoDao = new AdvisorOrganizationDao(dbHandle, groupDao);
		billetDao = new BilletDao(dbHandle);
		asDao = new ApprovalStepDao(dbHandle);
		approvalActionDao = new ApprovalActionDao(dbHandle);
		reportDao = new ReportDao(dbHandle);
		
		daoMap = new HashMap<Class<? extends AbstractAnetView<?>>, IAnetDao<?>>();
		daoMap.put(Person.class, personDao);
		daoMap.put(Group.class, groupDao);
		daoMap.put(Location.class, locationDao);
		daoMap.put(AdvisorOrganization.class, aoDao);
		daoMap.put(Billet.class, billetDao);
//		daoMap.put(Poam.class, poamDao);
//		daoMap.put(Tashkil.class, tashkilDao);
//		daoMap.put(ApprovalStep.class, asDao);
//		daoMap.put(ApprovalAction.class, approvalActionDao);
		daoMap.put(Report.class, reportDao);
	}
	
	public PersonDao getPersonDao() { 
		return personDao;
	}
	
	public GroupDao groupDao() { 
		return groupDao;
	}
	
	public TashkilDao getTashkilDao() { 
		return tashkilDao;
	}
	
	public PoamDao getPoamDao() { 
		return poamDao;
	}

	public GroupDao getGroupDao() {
		return groupDao;
	}

	public LocationDao getLocationDao() {
		return locationDao;
	}

	public AdvisorOrganizationDao getAdvisorOrganizationDao() {
		return aoDao;
	}

	public ApprovalActionDao getApprovalActionDao() {
		return approvalActionDao;
	}

	public BilletDao getBilletDao() {
		return billetDao;
	}

	public ApprovalStepDao getApprovalStepDao() {
		return asDao;
	}

	public ReportDao getReportDao() {
		return reportDao;
	}
	
	public AdvisorOrganization getAdvisorOrganizationForPerson(Person p) { 
		return personDao.getAdvisorOrganizationForPerson(p.getId());
	}
	
	public List<ApprovalStep> getApprovalStepsForOrg(AdvisorOrganization ao) { 
		Collection<ApprovalStep> unordered = asDao.getByAdvisorOrganizationId(ao.getId());
		
		int numSteps = unordered.size();
		ArrayList<ApprovalStep> ordered = new ArrayList<ApprovalStep>(numSteps);
		Integer nextStep = null;
		for (int i=0;i<numSteps;i++) { 
			for (ApprovalStep as : unordered) { 
				if (Objects.equals(as.getNextStepId(), nextStep)) { 
					ordered.add(0, as);
					nextStep = as.getId();
					break;
				}
			}
		}
		return ordered;
	}
	
	public boolean canUserApproveStep(int userId, int approvalStepId) { 
		ApprovalStep as = asDao.getById(approvalStepId);
		Group approvers = groupDao.getById(as.getApproverGroupId());
		for (Person member : approvers.getMembers()) { 
			if (member.getId() == userId) { return true; } 
		}
		return false;
	}

	public static AbstractAnetView<?> loadBeanTo(AbstractAnetView<?> bean, LoadLevel ll) {
		@SuppressWarnings("unchecked")
		IAnetDao<? extends AbstractAnetView<?>> dao = (IAnetDao<? extends AbstractAnetView<?>>) daoMap.get(bean.getClass());
		if ( dao == null) { throw new UnsupportedOperationException("No dao loaded for " + bean.getClass()); }
		//TODO: support load levels above PROPERTIES. 
		return dao.getById(bean.getId());
	}
}
