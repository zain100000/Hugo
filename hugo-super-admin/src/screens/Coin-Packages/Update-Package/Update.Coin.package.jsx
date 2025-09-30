/**
 * UpdateCoinPackage Component
 *
 * Provides an interface for Super Admins to update existing coin packages.
 *
 * Features:
 * - Prefilled input fields for package name, coins, price, currency, and duration
 * - Duration supports both value (number) and unit (day/week/month/year)
 * - Form validation using validation utilities
 * - Integration with Redux slice (`packageSlice`) for backend API update
 * - Toast notifications for success/error
 * - Loading state on form submission
 *
 * @component
 * @module UpdateCoinPackage
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Update.Coin.package.css";
import "../../../styles/global.styles.css";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import { toast } from "react-hot-toast";
import {
  updatePackage,
  getPackages,
} from "../../../redux/slices/package.slice";
import { validateFields } from "../../../utilities/Validations/Validation.utility";
import Loader from "../../../utilities/Loader/Loader.utility";

const UpdateCoinPackage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const packages = useSelector((state) => state.packages.packages);
  const user = useSelector((state) => state.auth.user);

  const pkgFromState = location.state?.pkg;

  const [name, setName] = useState("");
  const [coins, setCoins] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("day");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchingPackage, setFetchingPackage] = useState(true);

  const findPackageById = () => {
    if (Array.isArray(packages)) {
      return packages.find((pkg) => pkg._id === id);
    }
    return null;
  };

  const pkg = pkgFromState || findPackageById();

  useEffect(() => {
    const fetchPackagesIfNeeded = async () => {
      if (!pkg && user?.id) {
        try {
          setFetchingPackage(true);
          await dispatch(getPackages()).unwrap();
        } catch (error) {
          toast.error("Failed to load package data");
          // console.error("Error fetching packages:", error); // Removed console.error
        } finally {
          setFetchingPackage(false);
        }
      } else {
        setFetchingPackage(false);
      }
    };

    fetchPackagesIfNeeded();
  }, [dispatch, user?.id, pkg]);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name || "");
      setCoins(pkg.coins || "");
      setPrice(pkg.price || "");
      setCurrency(pkg.currency || "PKR");
      setDurationValue(pkg.duration?.value || "");
      setDurationUnit(pkg.duration?.unit || "day");
    }
  }, [pkg]);

  useEffect(() => {
    if (!fetchingPackage && !pkg) {
      toast.error("Package not found");
      navigate("/super-admin/coin-packages/manage-coin-packages");
    }
  }, [fetchingPackage, pkg, navigate]);

  const validateField = (fieldName, value) => {
    const validationResult = validateFields({ [fieldName]: value });
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validationResult[fieldName] || "",
    }));
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    validateField("name", e.target.value);
  };

  const handleCoinsChange = (e) => {
    setCoins(e.target.value);
    validateField("coins", e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
    validateField("price", e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    validateField("currency", e.target.value);
  };

  const handleDurationValueChange = (e) => {
    setDurationValue(e.target.value);
    validateField("durationValue", e.target.value);
  };

  const handleDurationUnitChange = (e) => {
    setDurationUnit(e.target.value);
    validateField("durationUnit", e.target.value);
  };

  const handleUpdatePackage = async (e) => {
    e.preventDefault();

    const validationErrors = validateFields({
      name,
      coins,
      price,
      currency,
      durationValue,
      durationUnit,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    const packageData = {
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

      const resultAction = await dispatch(
        updatePackage({
          packageId: id,
          packageData,
        })
      );

      if (updatePackage.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload?.message || "Package updated successfully";
        toast.success(successMessage);

        setTimeout(() => {
          navigate("/super-admin/coin-packages/manage-coin-packages");
        }, 1500);
      } else if (updatePackage.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;
        let errorMessage = "Failed to update package";

        if (errorPayload) {
          errorMessage = errorPayload.message || errorMessage;
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");

  if (fetchingPackage) {
    return (
      <section id="add-coin-package">
        <div className="container">
          <div className="loader-container">
            <Loader />
          </div>
        </div>
      </section>
    );
  }

  if (!pkg && !fetchingPackage) {
    return (
      <section id="add-coin-package">
        <div className="container">
          <div className="no-package-found">
            <div className="empty-content">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Package not found</p>
              <Button
                title="Back to Packages"
                onPress={() =>
                  navigate("/super-admin/coin-packages/manage-coin-packages")
                }
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="add-coin-package">
      <div className="container">
        <h2 className="package-title">Update Coin Package</h2>

        <form className="package-form" onSubmit={handleUpdatePackage}>
          <div className="row">
            <div className="col-md-6">
              <InputField
                placeholder="Package Name"
                type="text"
                value={name}
                onChange={handleNameChange}
                icon={<i className="fas fa-box-open"></i>}
                textColor={"#000"}
                error={errors.name}
                required
              />
            </div>

            <div className="col-md-6">
              <InputField
                placeholder="Coins"
                type="number"
                value={coins}
                onChange={handleCoinsChange}
                icon={<i className="fas fa-coins"></i>}
                textColor={"#000"}
                error={errors.coins}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <InputField
                placeholder="Price"
                type="number"
                value={price}
                onChange={handlePriceChange}
                icon={<i className="fas fa-money-bill-wave"></i>}
                textColor={"#000"}
                error={errors.price}
                required
              />
            </div>

            <div className="col-md-6">
              <InputField
                placeholder="Currency"
                value={currency}
                onChange={handleCurrencyChange}
                icon={<i className="fas fa-yen-sign"></i>}
                textColor={"#000"}
                error={errors.currency}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <InputField
                placeholder="Duration Value"
                type="number"
                value={durationValue}
                onChange={handleDurationValueChange}
                icon={<i className="fas fa-hourglass"></i>}
                textColor={"#000"}
                error={errors.durationValue}
                required
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
                onValueChange={handleDurationUnitChange}
                icon={<i className="fas fa-clock"></i>}
                textColor="#000"
                error={errors.durationUnit}
                required
              />
            </div>
          </div>

          <div className="text-center mt-3">
            <Button
              title="Update Package"
              onPress={handleUpdatePackage}
              loading={loading}
              disabled={hasErrors || loading}
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default UpdateCoinPackage;
