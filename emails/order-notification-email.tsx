import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  size?: string | null;
  material?: string | null;
}

interface OrderNotificationEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  paymentMethod: string;
  locale: 'es' | 'en';
}

const translations = {
  es: {
    preview: 'Nuevo pedido recibido - Oro Nacional',
    title: 'Nuevo Pedido Recibido',
    orderNumber: 'Número de Pedido',
    customerInfo: 'Información del Cliente',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    orderDetails: 'Detalles del Pedido',
    product: 'Producto',
    quantity: 'Cantidad',
    price: 'Precio',
    size: 'Talla',
    material: 'Material',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    tax: 'IVA (16%)',
    total: 'Total',
    shippingInfo: 'Información de Envío',
    address: 'Dirección',
    city: 'Ciudad',
    state: 'Estado',
    zipCode: 'Código Postal',
    paymentMethod: 'Método de Pago',
    footer: 'Este correo fue generado automáticamente cuando se recibió un nuevo pedido.',
  },
  en: {
    preview: 'New order received - Oro Nacional',
    title: 'New Order Received',
    orderNumber: 'Order Number',
    customerInfo: 'Customer Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    orderDetails: 'Order Details',
    product: 'Product',
    quantity: 'Quantity',
    price: 'Price',
    size: 'Size',
    material: 'Material',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax (16%)',
    total: 'Total',
    shippingInfo: 'Shipping Information',
    address: 'Address',
    city: 'City',
    state: 'State',
    zipCode: 'Zip Code',
    paymentMethod: 'Payment Method',
    footer: 'This email was automatically generated when a new order was received.',
  },
};

export const OrderNotificationEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  items,
  subtotal,
  shippingCost,
  tax,
  total,
  shippingAddress,
  shippingCity,
  shippingState,
  shippingZipCode,
  paymentMethod,
  locale = 'es',
}: OrderNotificationEmailProps) => {
  const t = translations[locale];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.title}</Heading>

          <Section style={section}>
            <Text style={label}>{t.orderNumber}:</Text>
            <Text style={orderNumberText}>{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading style={h2}>{t.customerInfo}</Heading>
            <Text style={text}>
              <strong>{t.name}:</strong> {customerName}
            </Text>
            <Text style={text}>
              <strong>{t.email}:</strong> {customerEmail}
            </Text>
            <Text style={text}>
              <strong>{t.phone}:</strong> {customerPhone}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading style={h2}>{t.orderDetails}</Heading>
            {items.map((item, index) => (
              <Section key={index} style={itemSection}>
                <Text style={itemName}>{item.product_name}</Text>
                <Row>
                  <Column style={itemColumn}>
                    <Text style={itemLabel}>{t.quantity}: {item.quantity}</Text>
                  </Column>
                  <Column style={itemColumn}>
                    <Text style={itemLabel}>{t.price}: {formatCurrency(item.unit_price)}</Text>
                  </Column>
                </Row>
                {item.size && (
                  <Text style={itemDetail}>{t.size}: {item.size}</Text>
                )}
                {item.material && (
                  <Text style={itemDetail}>{t.material}: {item.material}</Text>
                )}
                <Text style={itemSubtotal}>
                  {t.subtotal}: {formatCurrency(item.unit_price * item.quantity)}
                </Text>
              </Section>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Row>
              <Column style={summaryColumn}>
                <Text style={summaryLabel}>{t.subtotal}:</Text>
              </Column>
              <Column style={summaryColumn}>
                <Text style={summaryValue}>{formatCurrency(subtotal)}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={summaryColumn}>
                <Text style={summaryLabel}>{t.shipping}:</Text>
              </Column>
              <Column style={summaryColumn}>
                <Text style={summaryValue}>{formatCurrency(shippingCost)}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={summaryColumn}>
                <Text style={summaryLabel}>{t.tax}:</Text>
              </Column>
              <Column style={summaryColumn}>
                <Text style={summaryValue}>{formatCurrency(tax)}</Text>
              </Column>
            </Row>
            <Hr style={summaryHr} />
            <Row>
              <Column style={summaryColumn}>
                <Text style={totalLabel}>{t.total}:</Text>
              </Column>
              <Column style={summaryColumn}>
                <Text style={totalValue}>{formatCurrency(total)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Heading style={h2}>{t.shippingInfo}</Heading>
            <Text style={text}>{shippingAddress}</Text>
            <Text style={text}>
              {shippingCity}, {shippingState} {shippingZipCode}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={label}>{t.paymentMethod}:</Text>
            <Text style={text}>{paymentMethod}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderNotificationEmail;

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#D4AF37',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  padding: '0 48px',
  margin: '30px 0',
};

const h2 = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0',
  marginBottom: '16px',
};

const section = {
  padding: '0 48px',
  margin: '16px 0',
};

const text = {
  color: '#1e293b',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
  marginBottom: '8px',
};

const label = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  marginBottom: '4px',
};

const orderNumberText = {
  color: '#D4AF37',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0',
  marginTop: '4px',
};

const itemSection = {
  backgroundColor: '#f8fafc',
  padding: '16px',
  margin: '8px 0',
  borderRadius: '8px',
};

const itemName = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  marginBottom: '8px',
};

const itemColumn = {
  width: '50%',
};

const itemLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  marginBottom: '4px',
};

const itemDetail = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  marginTop: '4px',
};

const itemSubtotal = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  marginTop: '8px',
};

const summaryColumn = {
  width: '50%',
};

const summaryLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  marginBottom: '8px',
};

const summaryValue = {
  color: '#1e293b',
  fontSize: '14px',
  textAlign: 'right' as const,
  margin: '0',
  marginBottom: '8px',
};

const summaryHr = {
  borderColor: '#e2e8f0',
  margin: '16px 0',
};

const totalLabel = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
  marginTop: '8px',
};

const totalValue = {
  color: '#D4AF37',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'right' as const,
  margin: '0',
  marginTop: '8px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 48px',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '1.5',
  padding: '0 48px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

