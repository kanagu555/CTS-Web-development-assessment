import type { Txn } from "../models/Txn";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { txnSchema } from "../service/txnSchema";

import { Form, Col, Button } from "react-bootstrap";

const todayISO = () => new Date().toISOString().substring(0, 10);

const TxnForm = ({
  t,
  save,
  cancel,
}: {
  t?: Txn;
  save: (txn: Txn) => void;
  cancel?: (id: number) => void;
}) => {
  const defaultValues: any = t
    ? { ...t }
    : {
        id: 0,
        header: "",
        txnDate: todayISO(),
        txnType: "CREDIT",
        amount: 0,
        isEditable: false,
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<Txn>({
    defaultValues,
    resolver: yupResolver(txnSchema),
    mode: "onBlur",
  });

  console.log("errors:", errors);

  const txnType = watch("txnType");

  const toggleType = (type: "CREDIT" | "DEBIT") => {
    setValue("txnType", type, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = (data: any) => {
    save({ ...data });

    if (!data.isEditable) {
      reset({
        id: 0,
        header: "",
        txnDate: todayISO(),
        txnType: "CREDIT",
        amount: 0,
      });
    }
  };

  return (
    <Form
      className="row p-1 mb-1 border-bottom border-info"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Col xs={1} className="text-end">
        {watch("id")}
      </Col>

      <Col xs={2} className="text-center">
        <Form.Control
          type="date"
          size="sm"
          {...register("txnDate")}
          className={errors.txnDate ? "bg-danger" : ""}
          title={errors.txnDate?.message ?? ""}
        />
      </Col>

      <Col>
        <Form.Control
          type="text"
          placeholder="Description"
          size="sm"
          {...register("header")}
          className={errors.header ? "bg-danger" : ""}
          title={errors.header?.message ?? ""}
        />
      </Col>

      <Col
        xs={2}
        className="text-end"
        onClick={() => toggleType("CREDIT")}
        role="button"
        title="Set as CREDIT"
      >
        {txnType === "CREDIT" && (
          <Form.Control
            type="number"
            size="sm"
            inputMode="decimal"
            {...register("amount", { valueAsNumber: true })}
            className={errors.amount ? "bg-danger text-end" : "text-end"}
            title={errors.amount?.message ?? ""}
          />
        )}
      </Col>

      <Col
        xs={2}
        className="text-end"
        onClick={() => toggleType("DEBIT")}
        role="button"
        title="Set as DEBIT"
      >
        {txnType === "DEBIT" && (
          <Form.Control
            type="number"
            size="sm"
            inputMode="decimal"
            {...register("amount", { valueAsNumber: true })}
            className={errors.amount ? "bg-danger text-end" : "text-end"}
            title={errors.amount?.message ?? ""}
          />
        )}
      </Col>

      <Col xs={2} className="text-center">
        <Button type="submit" size="sm" variant="primary">
          <i className="bi bi-floppy" />
        </Button>

        {watch("isEditable") && (
          <Button
            size="sm"
            variant="danger"
            className="ms-1"
            type="button"
            onClick={() => cancel?.(watch("id"))}
          >
            <i className="bi bi-x-circle" />
          </Button>
        )}
      </Col>
    </Form>
  );
};

export default TxnForm;
