import shopify from './shopify.js'

const noteUpdate = {
  setUpNewNote: function (createdOrder) {
    let newNote = '',
      noteItemsCount = 1

    const buyersNote = createdOrder.note
      ? createdOrder.note.split("Buyer's Note:")[1] || createdOrder.note
      : createdOrder.note || ''

    createdOrder.line_items.forEach((item) => {
      if (item.handle != 'gift-wrapping') {
        let giftWraps = []
        if (noteItemsCount > 1) newNote += '\n'

        const allProperties = {}
        item.properties.forEach((property) => {
          allProperties[property.name] = property.value
        })

        newNote += `Product#${noteItemsCount} > ${item.title} > ${allProperties.Packaging}`

        noteItemsCount++
        Object.keys(allProperties).forEach((key, index) => {
          if (key.includes('Gift Wrap') && key.includes('To')) {
            let giftWrapLabel
            if (key.indexOf('#') === -1) {
              giftWrapLabel = key.split('To')[0]
            } else {
              giftWrapLabel = key.slice(0, key.indexOf('#') + 2)
            }
            giftWraps.push({
              GiftWrapLabel: giftWrapLabel,
              To: allProperties[key],
              From: allProperties[Object.keys(allProperties)[index + 1]],
              Message: allProperties[Object.keys(allProperties)[index + 2]],
            })
          }
        })
        if (giftWraps.length > 0) {
          giftWraps.forEach((gift) => {
            newNote += ` > ${gift.GiftWrapLabel} > To: ${gift.To} > From: ${gift.From} > Message: ${gift.Message}`
          })
        }
      }
    })

    newNote += "\n Buyer's Note: "
    newNote += `\n ${buyersNote}`

    console.log(newNote)

    return newNote
  },

  updateOrderNote: async function (orderId, newNote, session) {
    console.log(session.accessToken)
    const client = new shopify.api.clients.Graphql({ session: session })
    const query = this.setUpQuery(orderId, newNote)
    const data = await client.query({
      data: {
        query: query,
        variables: {
          input: {
            id: orderId,
            note: newNote,
          },
        },
      },
    })
    return data
  },

  setUpQuery: function (orderId, newNote) {
    return `mutation updateOrderMetafields($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            note
          }
          userErrors {
            message
            field
          }
        }
      }`
  },

  init: async function (createdOrder, session) {
    //Setup new note
    const newNote = this.setUpNewNote(createdOrder)
    console.log(session.accessToken)

    //Update note:
    const response = await this.updateOrderNote(
      createdOrder.admin_graphql_api_id,
      newNote,
      session
    )
    console.log(response)
  },
}

export default noteUpdate
