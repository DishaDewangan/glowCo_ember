export function buildSegmentQuery(filterCriteria) {
  const query = {};

  if (filterCriteria.last_order_days) {
    const { min, max } = filterCriteria.last_order_days;
    const now = new Date();
    query.lastOrderDate = {};
    if (min !== undefined) {
      const minDate = new Date(now);
      minDate.setDate(minDate.getDate() - min);
      query.lastOrderDate.$lte = minDate;
    }
    if (max !== undefined) {
      const maxDate = new Date(now);
      maxDate.setDate(maxDate.getDate() - max);
      query.lastOrderDate.$gte = maxDate;
    }
  }

  if (filterCriteria.total_orders) {
    query.totalOrders = {};
    if (filterCriteria.total_orders.min !== undefined) {
      query.totalOrders.$gte = filterCriteria.total_orders.min;
    }
    if (filterCriteria.total_orders.max !== undefined) {
      query.totalOrders.$lte = filterCriteria.total_orders.max;
    }
  }

  if (filterCriteria.avg_spend) {
    query.avgSpend = {};
    if (filterCriteria.avg_spend.min !== undefined) {
      query.avgSpend.$gte = filterCriteria.avg_spend.min;
    }
    if (filterCriteria.avg_spend.max !== undefined) {
      query.avgSpend.$lte = filterCriteria.avg_spend.max;
    }
  }

  if (filterCriteria.skin_type) {
    query.skinType = Array.isArray(filterCriteria.skin_type)
      ? { $in: filterCriteria.skin_type }
      : filterCriteria.skin_type;
  }

  if (filterCriteria.preferred_channel) {
    query.preferredChannel = filterCriteria.preferred_channel;
  }

  if (filterCriteria.cohort_date) {
    query.cohortDate = {};
    if (filterCriteria.cohort_date.after) {
      query.cohortDate.$gte = new Date(filterCriteria.cohort_date.after);
    }
    if (filterCriteria.cohort_date.before) {
      query.cohortDate.$lte = new Date(filterCriteria.cohort_date.before);
    }
  }

  if (filterCriteria.routine_completeness_score) {
    query.routineCompletenessScore = {};
    if (filterCriteria.routine_completeness_score.min !== undefined) {
      query.routineCompletenessScore.$gte = filterCriteria.routine_completeness_score.min;
    }
    if (filterCriteria.routine_completeness_score.max !== undefined) {
      query.routineCompletenessScore.$lte = filterCriteria.routine_completeness_score.max;
    }
  }

  if (filterCriteria.products_purchased_includes) {
    query.productsPurchased = { $all: filterCriteria.products_purchased_includes };
  }

  if (filterCriteria.products_purchased_excludes) {
    query.productsPurchased = {
      ...query.productsPurchased,
      $nin: filterCriteria.products_purchased_excludes,
    };
  }

  if (filterCriteria.city) {
    query.city = Array.isArray(filterCriteria.city)
      ? { $in: filterCriteria.city }
      : filterCriteria.city;
  }

  return query;
}

export async function runSegmentQuery(filterCriteria) {
  const Customer = (await import('../models/Customer.js')).default;
  const mongoQuery = buildSegmentQuery(filterCriteria);
  const customers = await Customer.find(mongoQuery).lean();
  return { mongoQuery, customers, count: customers.length };
}
