import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TeamManagementComponent } from './team-management.component';
import { TeamManagementService } from '../../../../../../core/services/domain/team-management/team-management.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';

describe('TeamManagementComponent', () => {
  let component: TeamManagementComponent;
  let fixture: ComponentFixture<TeamManagementComponent>;
  let mockTeamService: jasmine.SpyObj<TeamManagementService>;
  let mockUserStructureService: jasmine.SpyObj<UserStructureService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const teamServiceSpy = jasmine.createSpyObj('TeamManagementService', [
      'loadTeamMembers',
      'refreshTeamMembers',
      'inviteTeamMember',
      'updateTeamMemberRole',
      'updateTeamMemberStatus',
      'removeTeamMember',
      'resendInvitation',
      'canManageTeam',
      'canEditMember',
      'canRemoveMember'
    ]);

    const userStructureServiceSpy = jasmine.createSpyObj('UserStructureService', ['userStructureId']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        TeamManagementComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TeamManagementService, useValue: teamServiceSpy },
        { provide: UserStructureService, useValue: userStructureServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamManagementComponent);
    component = fixture.componentInstance;
    mockTeamService = TestBed.inject(TeamManagementService) as jasmine.SpyObj<TeamManagementService>;
    mockUserStructureService = TestBed.inject(UserStructureService) as jasmine.SpyObj<UserStructureService>;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default return values
    mockTeamService.loadTeamMembers.and.returnValue(of([]));
    mockTeamService.canManageTeam.and.returnValue(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load team data on init', () => {
    component.ngOnInit();
    expect(mockTeamService.loadTeamMembers).toHaveBeenCalled();
  });

  it('should toggle invite form', () => {
    expect(component.showInviteForm()).toBeFalse();
    component.toggleInviteForm();
    expect(component.showInviteForm()).toBeTrue();
    component.toggleInviteForm();
    expect(component.showInviteForm()).toBeFalse();
  });

  it('should navigate back to structure management', () => {
    component.navigateBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/structure']);
  });

  it('should send invitation when form is valid', () => {
    const mockMember = { id: 1, email: 'test@test.com' };
    mockTeamService.inviteTeamMember.and.returnValue(of(mockMember as any));

    component.inviteForm.patchValue({
      email: 'test@test.com',
      roleId: 1
    });

    component.sendInvitation();

    expect(mockTeamService.inviteTeamMember).toHaveBeenCalledWith('test@test.com', 1);
  });
});
