import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import User from './User'
import SlackNotification from 'server/graphql/types/SlackNotification'
import {GQLContext} from 'server/graphql/graphql'

const SetSlackNotificationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetSlackNotificationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    slackNotifications: {
      type: new GraphQLList(new GraphQLNonNull(SlackNotification)),
      resolve: async ({slackNotificationIds}, _args, {dataLoader}) => {
        return dataLoader.get('slackNotifications').loadMany(slackNotificationIds)
      }
    },
    user: {
      type: User,
      description: 'The user with updated slack notifications',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default SetSlackNotificationPayload
