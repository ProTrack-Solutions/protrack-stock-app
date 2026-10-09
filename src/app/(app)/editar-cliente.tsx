import { useLocalSearchParams } from "expo-router";

import { CustomerFormScreen } from "@/components/customer/customer-form-screen";

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CustomerFormScreen key={id} customerId={id} />;
}
