blocks : [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `It looks like you have {{{vars.existing_ko_count}}} ideas in your binder.`
        }
    },
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "Yes"
                },
                "style": "primary",
                "value": "yes"
            },
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "No"
                },
                "style": "danger",
                "value": "no"
            }
        ]
    }
]