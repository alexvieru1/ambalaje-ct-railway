import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Vă mulțumim pentru comandă!' }) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const currency = order.currency_code?.toUpperCase()

  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          Confirmare comandă
        </Text>

        <Text style={{ margin: '0 0 15px' }}>
          Bună ziua, {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>

        <Text style={{ margin: '0 0 30px' }}>
          Vă mulțumim pentru comanda plasată! Mai jos găsiți detaliile comenzii:
        </Text>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Detalii comandă
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Comandă: #{order.display_id}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Data: {orderDate}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          Total: {order.summary.raw_current_order_total.value} {currency}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Adresa de livrare
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.address_1}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.city}{shippingAddress.province ? `, ${shippingAddress.province}` : ''} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {shippingAddress.country_code?.toUpperCase()}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Produse comandate
        </Text>

        <div style={{
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px',
          margin: '10px 0',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f2f2f2',
            padding: '10px 12px',
            borderBottom: '1px solid #ddd',
          }}>
            <Text style={{ fontWeight: 'bold', margin: 0, flex: 2 }}>Produs</Text>
            <Text style={{ fontWeight: 'bold', margin: 0, flex: 1, textAlign: 'center' }}>Cant.</Text>
            <Text style={{ fontWeight: 'bold', margin: 0, flex: 1, textAlign: 'right' }}>Preț</Text>
          </div>
          {order.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid #eee',
            }}>
              <Text style={{ margin: 0, flex: 2 }}>
                {item.product_title}{item.title !== item.product_title ? ` — ${item.title}` : ''}
              </Text>
              <Text style={{ margin: 0, flex: 1, textAlign: 'center' }}>{item.quantity}</Text>
              <Text style={{ margin: 0, flex: 1, textAlign: 'right' }}>{item.unit_price} {currency}</Text>
            </div>
          ))}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9f9f9',
            borderTop: '2px solid #ddd',
          }}>
            <Text style={{ fontWeight: 'bold', margin: 0, flex: 2 }}>Total</Text>
            <Text style={{ margin: 0, flex: 1 }}></Text>
            <Text style={{ fontWeight: 'bold', margin: 0, flex: 1, textAlign: 'right' }}>
              {order.summary.raw_current_order_total.value} {currency}
            </Text>
          </div>
        </div>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '13px', color: '#666', margin: '0' }}>
          Dacă aveți întrebări, ne puteți contacta la office@ambalajeconstanta.ro sau la 0722 631 611.
        </Text>
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: '1042',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'ron',
    items: [
      { id: 'item-1', title: 'Cutie carton 400x300x200', product_title: 'Cutie carton 400x300x200', quantity: 50, unit_price: 3.5 },
      { id: 'item-2', title: 'Folie stretch manuală 500mm', product_title: 'Folie stretch manuală 500mm', quantity: 6, unit_price: 28 }
    ],
    shipping_address: {
      first_name: 'Andrei',
      last_name: 'Popescu',
      address_1: 'Str. Mihai Viteazu, Nr. 15',
      city: 'Constanța',
      province: '',
      postal_code: '900725',
      country_code: 'ro'
    },
    summary: { raw_current_order_total: { value: 343 } }
  },
  shippingAddress: {
    first_name: 'Andrei',
    last_name: 'Popescu',
    address_1: 'Str. Mihai Viteazu, Nr. 15',
    city: 'Constanța',
    province: '',
    postal_code: '900725',
    country_code: 'ro'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
