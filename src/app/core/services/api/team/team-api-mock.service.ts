/**
 * @file Service mock pour les API d'équipes.
 * @licence Proprietary
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiConfigService } from '../api-config.service';
import { AuthService } from '../../domain/user/auth.service';
import {
  TeamMember,
  Role,
  InviteTeamMemberDto,
  UpdateTeamMemberDto,
  InviteTeamMemberResponseDto,
  TeamMemberStatus,
  availableRoles,
  getRoleById,
  getRoleIdByKey
} from '../../../models/user/team-member.model';
import { UserRole } from '../../../models/user/user-role.enum';
import { mockTeamMembersStructure3 } from '../../../mocks/auth/data/team-data.mock';

@Injectable({
  providedIn: 'root'
})
export class TeamApiMockService {
  private apiConfig = inject(ApiConfigService);
  private authService = inject(AuthService);

  private mockTeamMembers: TeamMember[] = JSON.parse(JSON.stringify(mockTeamMembersStructure3));

  mockGetStructureTeamMembers(structureId: number): Observable<TeamMember[]> {
    const endpointContext = `team/structure/${structureId}`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    // Pour cet exemple, on ne retourne les données que pour la structure 3
    if (structureId === 3) {
      return this.apiConfig.createMockResponse([...this.mockTeamMembers]);
    }

    return this.apiConfig.createMockResponse([]);
  }

  mockGetAvailableRoles(): Observable<Role[]> {
    const endpointContext = 'team/roles';
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    return this.apiConfig.createMockResponse([...availableRoles]);
  }

  mockInviteTeamMember(inviteDto: InviteTeamMemberDto): Observable<InviteTeamMemberResponseDto> {
    const endpointContext = 'team/invite';
    this.apiConfig.logApiRequest('MOCK POST', endpointContext, inviteDto);

    // Vérifier si l'email existe déjà dans l'équipe
    const existingMember = this.mockTeamMembers.find(member => member.email === inviteDto.email);
    if (existingMember) {
      return this.apiConfig.createMockError(409, 'Mock: Cet utilisateur est déjà membre de la structure.');
    }

    // Vérifier que le rôle est valide
    const role = getRoleById(inviteDto.roleId);
    if (!role) {
      return this.apiConfig.createMockError(400, 'Mock: Rôle invalide.');
    }

    const currentUserId = this.authService.currentUser()?.userId;
    const newMember: TeamMember = {
      id: Math.max(...this.mockTeamMembers.map(m => m.id)) + 1,
      userId: undefined, // Pas encore d'utilisateur créé
      structureId: 3, // Hardcodé pour le mock
      firstName: null,
      lastName: null,
      email: inviteDto.email,
      role: role,
      status: TeamMemberStatus.PENDING,
      joinedAt: new Date(),
      invitedAt: new Date(),
      invitedBy: currentUserId,
      lastActivity: undefined,
      phone: undefined,
      position: undefined
    };

    this.mockTeamMembers.push(newMember);

    return this.apiConfig.createMockResponse({
      success: true,
      message: 'Invitation envoyée avec succès',
      member: newMember
    });
  }

  mockUpdateTeamMember(memberId: number, updateDto: UpdateTeamMemberDto): Observable<TeamMember> {
    const endpointContext = `team/member/${memberId}`;
    this.apiConfig.logApiRequest('MOCK PUT', endpointContext, updateDto);

    const memberIndex = this.mockTeamMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return this.apiConfig.createMockError(404, 'Mock: Membre d\'équipe non trouvé.');
    }

    const currentMember = this.mockTeamMembers[memberIndex];
    const updatedMember: TeamMember = {
      ...currentMember,
      role: updateDto.roleId ? getRoleById(updateDto.roleId)! : currentMember.role,
      status: updateDto.status ?? currentMember.status,
      position: updateDto.position ?? currentMember.position,
      phone: updateDto.phone ?? currentMember.phone,
      lastActivity: new Date()
    };

    this.mockTeamMembers[memberIndex] = updatedMember;
    return this.apiConfig.createMockResponse(updatedMember);
  }

  mockRemoveTeamMember(memberId: number): Observable<void> {
    const endpointContext = `team/member/${memberId}`;
    this.apiConfig.logApiRequest('MOCK DELETE', endpointContext);

    const memberIndex = this.mockTeamMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return this.apiConfig.createMockError(404, 'Mock: Membre d\'équipe non trouvé.');
    }

    this.mockTeamMembers.splice(memberIndex, 1);
    return this.apiConfig.createMockResponse(undefined);
  }

  mockResendTeamMemberInvitation(memberId: number): Observable<any> {
    const endpointContext = `team/member/${memberId}/resend-invitation`;
    this.apiConfig.logApiRequest('MOCK POST', endpointContext);

    const member = this.mockTeamMembers.find(m => m.id === memberId);
    if (!member) {
      return this.apiConfig.createMockError(404, 'Mock: Membre d\'équipe non trouvé.');
    }

    if (member.status !== TeamMemberStatus.PENDING) {
      return this.apiConfig.createMockError(400, 'Mock: Seuls les membres en attente peuvent recevoir une nouvelle invitation.');
    }

    // Mettre à jour la date d'invitation
    member.invitedAt = new Date();

    return this.apiConfig.createMockResponse({
      success: true,
      message: 'Invitation renvoyée avec succès'
    });
  }
}
