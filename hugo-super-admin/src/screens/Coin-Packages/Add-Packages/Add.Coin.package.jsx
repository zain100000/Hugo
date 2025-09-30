/**
 * AddCoinPackage Component
 *
 * Provides an interface for Super Admins to create new coin packages.
 *
 * Features:
 * - Input fields for package name, coins, price, currency, and duration
 * - Duration supports both value (number) and unit (day/week/month/year)
 * - Form validation to ensure  fields are filled
 * - Integration with Redux slice (`packageSlice`) for backend API call
 * - Toast notifications for success and error states
 * - Loading state on form submission
 *
 * State Shape:
 * {
 *   name: string,         // Package name (e.g. "Daily Pack")
 *   coins: number,        // Number of coins in the package
 *   price: number,        // Price of the package
 *   currency: string,     // Currency type (e.g. PKR, USD)
 *   duration: {           // Duration object
 *     value: number,      // Duration value
 *     unit: string        // Duration unit ("day" | "week" | "month" | "year")
 *   }
 * }
 *
 * Example usage:
 * ```jsx
 * return <AddCoinPackage />
 * ```
 *
 * @component
 * @module AddCoinPackage
 */

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import "./Add.Coin.package.css";
import "../../../styles/global.styles.css";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import { toast } from "react-hot-toast";
import { createPackage } from "../../../redux/slices/package.slice";
import { validateFields } from "../../../utilities/Validations/Validation.utility";
import { useNavigate } from "react-router-dom";

const AddCoinPackage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [coins, setCoins] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("day");
  const [loading, setLoading] = useState(false);

  const handleAddPackage = async (e) => {
    e.preventDefault();

    const validationErrors = validateFields({
      name,
      coins,
      price,
      currency,
      durationValue,
      durationUnit,
    });

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    const payload = {
      name,
      coins: Number(coins),
      price: Number(price),
      currency,
      duration: {
        value: Number(durationValue),
        unit: durationUnit,
      },
    };

    try {
      setLoading(true);

      const resultAction = await dispatch(createPackage(payload));

      if (createPackage.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload?.message || "Coin Package added successfully!";
        toast.success(successMessage);

        resetForm();
        navigate("/super-admin/coin-packages/manage-coin-packages");
      } else if (createPackage.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;
        const errorMessage =
          errorPayload?.message || "Failed to add package. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err) {
      // console.error("❌ Unexpected error while adding package:", err); // Removed console.error
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCoins("");
    setPrice("");
    setCurrency("PKR");
    setDurationValue("");
    setDurationUnit("day");
  };

  return (
    <section id="add-coin-package">
      <div className="container">
        <h2 className="package-title">Add Coin Package</h2>

        <form className="package-form" onSubmit={handleAddPackage}>
          <div className="row">
            <div className="col-md-6">
              <InputField
                placeholder="Package Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<i className="fas fa-box-open"></i>}
                textColor={"#000"}
              />
            </div>

            <div className="col-md-6">
              <InputField
                placeholder="Coins"
                type="number"
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
                icon={<i className="fas fa-coins"></i>}
                textColor={"#000"}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <InputField
                placeholder="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                icon={<i className="fas fa-money-bill-wave"></i>}
                textColor={"#000"}
              />
            </div>

            <div className="col-md-6">
              <InputField
                placeholder="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                icon={<i className="fas fa-yen-sign"></i>}
                textColor={"#000"}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <InputField
                placeholder="Duration Value"
                type="number"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                icon={<i className="fas fa-hourglass"></i>}
                textColor={"#000"}
              />
            </div>

            <div className="col-md-6">
              <InputField
                dropdownOptions={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                  { value: "year", label: "Year" },
                ]}
                selectedValue={durationUnit}
                onValueChange={(e) => setDurationUnit(e.target.value)}
                icon={<i className="fas fa-clock"></i>}
                textColor="#000"
              />
            </div>
          </div>

          <div className="text-center mt-3">
            <Button
              title="Add Package"
              onPress={handleAddPackage}
              loading={loading}
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddCoinPackage;
