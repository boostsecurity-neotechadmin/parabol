import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'

const hideConversionModal = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {showConversionModal} = organization
  if (showConversionModal) {
    const r = await getRethink()
    await getKysely()
      .updateTable('Organization')
      .set({showConversionModal: false})
      .where('id', '=', orgId)
      .execute()
    organization.showConversionModal = false
    const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
    const teamIds = teams.map(({id}) => id)
    const activeMeetingsByTeamId = (
      await dataLoader.get('activeMeetingsByTeamId').loadMany(teamIds)
    ).filter(errorFilter)
    if (activeMeetingsByTeamId.length > 0) {
      const activeMeetings = activeMeetingsByTeamId.flat()
      activeMeetings.forEach((meeting) => {
        meeting.showConversionModal = false
      })
      const meetingIds = activeMeetings.map(({id}) => id)
      await r
        .table('NewMeeting')
        .getAll(r.args(meetingIds))
        .update({
          showConversionModal: false
        })
        .run()
      return activeMeetings
    }
  }
  return []
}

export default hideConversionModal
