# keybase notifications through keybase-alerts bot

You need:

1.  The **keybase-alerts bot URL**.

Set it in `/etc/netdata/health_alarm_notify.conf` (to edit it on your system run `/etc/netdata/edit-config health_alarm_notify.conf`), like this:

```
###############################################################################
# sending keybase notifications

# enable/disable sending keybase notifications
SEND_KEYBASE="YES"

# Create a keybase-alerts bot url
KEYBASE_URL=""

