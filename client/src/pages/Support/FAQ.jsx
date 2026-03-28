import React from 'react';
import styles from './Support.module.css';

const FAQ_DATA = [
  { question: "How can I track my order?", answer: "Once your order is shipped, we'll send a tracking link via email and WhatsApp. You can also track your order from your profile's 'My Orders' section." },
  { question: "Can I cancel my order?", answer: "Orders can be cancelled within 2 hours of placement. For personalized items, cancellation is only possible if processing hasn't begun. Gift cards are non-refundable." },
  { question: "Is same-day delivery available?", answer: "Yes! If you order before 11 AM, same-day delivery is available for select items in major cities. Check the 'Same Day' label on products!" },
  { question: "Can I add a gift message?", answer: "Absolutely! You can add a personalized gift message at the checkout stage, and we'll print it on a beautiful card for you, free of cost." },
  { question: "What are the available payment modes?", answer: "We accept all major Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), and Net Banking. COD is currently available for non-personalized items below ₹2000." },
  { question: "Is international shipping available?", answer: "Currently, we only ship within India. Stay tuned as we expand our shipping capabilities soon!" }
];

const FAQ = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <div className={styles.content}>
          <div className={styles.faqList}>
            {FAQ_DATA.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <div className={styles.faqQuestion}>{item.question}</div>
                <div className={styles.faqAnswer}>{item.answer}</div>
              </div>
            ))}
          </div>
          
          <div className={styles.contactBox}>
            <p>Still have questions? Chat with our <strong>Goku AI</strong> on the bottom right!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
