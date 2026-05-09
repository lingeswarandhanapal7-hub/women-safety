const Alert = require('../models/Alert')
const User = require('../models/User')
const { sendEmergencySMS, makeEmergencyCall } = require('./twilio.service')
const { getIO } = require('../config/socket')

function startEscalationService() {
  setInterval(async () => {
    try {
      const overdueAlerts = await Alert.find({
        status: 'active',
        autoEscalateAt: { $lt: new Date() },
        level: { $lt: 3 }
      }).populate('userId')

      for (const alert of overdueAlerts) {
        const newLevel = alert.level + 1
        alert.level = newLevel
        alert.autoEscalateAt = new Date(Date.now() + 5 * 60 * 1000)
        alert.escalationHistory.push({
          level: newLevel,
          action: `Auto-escalated to Level ${newLevel} — no user response`,
          triggeredBy: 'system'
        })
        await alert.save()

        const user = alert.userId
        const io = getIO()

        io.to(`user:${user._id}`).emit('alert:escalated', {
          alertId: alert._id,
          newLevel,
          action: `Auto-escalated to Level ${newLevel} — no response detected`
        })

        if (newLevel >= 2 && user.trustedContacts) {
          for (const contact of user.trustedContacts) {
            if (contact.notifyOnLevel <= newLevel) {
              await sendEmergencySMS(contact, alert, user)
              if (newLevel >= 3) {
                await makeEmergencyCall(contact, user)
              }
            }
          }
        }

        if (newLevel === 3 && alert.location?.coordinates?.length === 2) {
          io.emit('community:nearby', {
            alertId: alert._id,
            lat: alert.location.lat,
            lng: alert.location.lng,
            message: 'Someone nearby needs help — Level 3 alert'
          })
        }

        console.log(`⚡ Auto-escalated alert ${alert._id} to Level ${newLevel}`)
      }
    } catch (err) {
      console.error('Escalation service error:', err.message)
    }
  }, 30000) // Check every 30 seconds

  console.log('🔄 Auto-escalation service started (30s interval)')
}

module.exports = { startEscalationService }
