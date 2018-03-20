import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import {DashContent, DashHeader, DashHeaderInfo, DashMain, DashSearchControl} from 'universal/components/Dashboard';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import EditTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditTeamName';
import TeamCallsToAction from 'universal/modules/teamDashboard/components/TeamCallsToAction/TeamCallsToAction';
import UnpaidTeamModalRoot from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalRoot';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import MeetingInProgressModal from '../MeetingInProgressModal/MeetingInProgressModal';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {ACTION} from 'universal/utils/constants';

// use the same object so the EditTeamName doesn't rerender so gosh darn always
const initialValues = {teamName: ''};

const Team = (props) => {
  const {
    atmosphere,
    children,
    hasMeetingAlert,
    isSettings,
    history,
    styles,
    team
  } = props;
  if (!team) return <LoadingView />;
  const {teamId, teamName, isPaid, meetingId, newMeeting} = team;
  const updateFilter = (e) => {
    const nextValue = e.target.value;
    commitLocalUpdate(atmosphere, (store) => {
      const teamProxy = store.get(teamId);
      teamProxy.setValue(nextValue, 'contentFilter');
    });
  };
  const hasActiveMeeting = Boolean(meetingId);
  const hasOverlay = hasActiveMeeting || !isPaid;
  initialValues.teamName = teamName;
  const DashHeaderInfoTitle = isSettings ?
    <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : '';
  const modalLayout = hasMeetingAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain;
  const goToTeamSettings = () =>
    history.push(`/team/${teamId}/settings/`);
  const goToTeamDashboard = () =>
    history.push(`/team/${teamId}`);
  return (
    <DashMain>
      <MeetingInProgressModal
        isOpen={hasActiveMeeting}
        meetingType={newMeeting ? newMeeting.meetingType : ACTION}
        modalLayout={modalLayout}
        teamId={teamId}
        teamName={teamName}
        key={`${teamId}MeetingModal`}
      />
      <UnpaidTeamModalRoot
        isOpen={!isPaid}
        teamId={teamId}
        modalLayout={modalLayout}
        key={`${teamId}UnpaidModal`}
      />
      <DashHeader
        area={isSettings ? 'teamSettings' : 'teamDash'}
        hasOverlay={hasOverlay}
        key={`team${isSettings ? 'Dash' : 'Settigns'}Header`}
      >
        <DashHeaderInfo title={DashHeaderInfoTitle}>
          {!isSettings && <DashSearchControl onChange={updateFilter} placeholder="Search Team Tasks & Agenda" />}
        </DashHeaderInfo>
        <div className={css(styles.teamLinks)}>
          {isSettings ?
            <Button
              key="1"
              buttonStyle="flat"
              colorPalette="dark"
              icon="arrow-circle-left"
              iconPlacement="left"
              isBlock
              label="Back to Team Dashboard"
              onClick={goToTeamDashboard}
              buttonSize="small"
            /> :
            <Button
              buttonSize="small"
              buttonStyle="flat"
              colorPalette="dark"
              icon="cog"
              iconPlacement="left"
              key="2"
              isBlock
              label="Team Settings"
              onClick={goToTeamSettings}
            />
          }
          <DashboardAvatars team={team} />
          {!isSettings &&
            <TeamCallsToAction teamId={teamId} />
          }
        </div>
      </DashHeader>
      <DashContent hasOverlay={hasOverlay} padding="0">
        {children}
      </DashContent>
    </DashMain>
  );
};

Team.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  children: PropTypes.any,
  hasMeetingAlert: PropTypes.bool,
  isSettings: PropTypes.bool.isRequired,
  history: PropTypes.object,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  teamLinks: {
    display: 'flex',
    flexWrap: 'nowrap'
  }
});

export default createFragmentContainer(
  withAtmosphere(withRouter(withStyles(styleThunk)(Team))),
  graphql`
    fragment Team_team on Team {
      contentFilter
      teamId: id
      teamName: name
      isPaid
      meetingId
      newMeeting {
        id
        meetingType
      }
      ...DashboardAvatars_team
    }
  `
);
